import { Injectable, NotFoundException, BadRequestException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { ReactionDto } from './dto/reaction.dto.js';

@Injectable()
export class CommunityService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`
        ALTER TABLE community.community_comments 
        ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES community.community_comments(id) ON DELETE CASCADE;
      `);
    } catch (err) {
      // Column may already exist or handled
    }
  }

  async findAll(category?: string, userId?: string, page: number = 1, limit: number = 10) {
    const whereClause = category && category !== 'ALL' ? { category } : {};
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(50, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, posts] = await Promise.all([
      this.prisma.post.count({ where: whereClause }),
      this.prisma.post.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              role: true,
              profile: {
                select: {
                  career: true,
                  avatar_url: true,
                }
              }
            }
          },
          _count: {
            select: { comments: true }
          },
          reactions: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    const authorIds = posts.map(p => p.user.id);
    const authorNicknames: Record<string, string> = {};
    if (authorIds.length > 0) {
      try {
        const nicks: any[] = await this.prisma.$queryRawUnsafe(
          `SELECT user_id, nickname FROM profile.user_profiles WHERE user_id = ANY($1::uuid[]) AND nickname IS NOT NULL`,
          authorIds
        );
        for (const n of nicks) {
          if (n.nickname) authorNicknames[n.user_id] = n.nickname;
        }
      } catch (err) {
        // fallback
      }
    }

    const postIds = posts.map(p => p.id);
    let commentsRaw: any[] = [];

    if (postIds.length > 0) {
      try {
        commentsRaw = await this.prisma.$queryRawUnsafe(
          `SELECT 
             c.id, c.post_id, c.user_id, c.parent_id, c.content, c.media_url, c.created_at,
             u.first_name, u.last_name,
             p.nickname, p.career, p.avatar_url
           FROM community.community_comments c
           LEFT JOIN identity.users u ON c.user_id = u.id
           LEFT JOIN profile.user_profiles p ON c.user_id = p.user_id
           WHERE c.post_id = ANY($1::uuid[])
           ORDER BY c.created_at ASC`,
          postIds
        );
      } catch (err) {
        // Fallback or retry
      }
    }

    const commentIds = commentsRaw.map(c => c.id);
    const commentReactionsMap: Record<string, { counts: Record<string, number>; userReaction: string | null }> = {};

    if (commentIds.length > 0) {
      try {
        const reactionsRaw: any[] = await this.prisma.$queryRawUnsafe(
          `SELECT id, comment_id, user_id, type FROM community.community_comment_reactions WHERE comment_id = ANY($1::uuid[])`,
          commentIds
        );

        for (const r of reactionsRaw) {
          if (!commentReactionsMap[r.comment_id]) {
            commentReactionsMap[r.comment_id] = { counts: {}, userReaction: null };
          }
          commentReactionsMap[r.comment_id].counts[r.type] = (commentReactionsMap[r.comment_id].counts[r.type] || 0) + 1;
          if (userId && r.user_id === userId) {
            commentReactionsMap[r.comment_id].userReaction = r.type;
          }
        }
      } catch (err) {
        // Table or query fallback gracefully
      }
    }

    // Group comments by post and nest replies (Instagram 1-level thread model)
    const commentsByPost: Record<string, any[]> = {};
    for (const p of posts) {
      commentsByPost[p.id] = [];
    }

    for (const c of commentsRaw) {
      const cData = commentReactionsMap[c.id] || { counts: {}, userReaction: null };
      const formattedComment = {
        id: c.id,
        post_id: c.post_id,
        user_id: c.user_id,
        parent_id: c.parent_id,
        content: c.content,
        media_url: c.media_url,
        created_at: c.created_at,
        user: {
          id: c.user_id,
          first_name: c.first_name,
          last_name: c.last_name,
          profile: {
            nickname: c.nickname ?? null,
            career: c.career,
            avatar_url: c.avatar_url,
          }
        },
        reactionCounts: cData.counts,
        userReaction: cData.userReaction,
        replies: [] as any[],
      };

      if (!commentsByPost[c.post_id]) {
        commentsByPost[c.post_id] = [];
      }
      commentsByPost[c.post_id].push(formattedComment);
    }

    const finalCommentsMap: Record<string, any[]> = {};
    for (const postId of Object.keys(commentsByPost)) {
      const allComments = commentsByPost[postId];
      const rootComments: any[] = [];
      const repliesMap: Record<string, any[]> = {};

      for (const c of allComments) {
        if (!c.parent_id) {
          rootComments.push(c);
        } else {
          if (!repliesMap[c.parent_id]) {
            repliesMap[c.parent_id] = [];
          }
          repliesMap[c.parent_id].push(c);
        }
      }

      for (const root of rootComments) {
        root.replies = repliesMap[root.id] || [];
      }

      finalCommentsMap[postId] = rootComments;
    }

    const items = posts.map(post => {
      // Calculate reactions
      const reactionCounts = post.reactions.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // User reaction
      const userReaction = userId ? post.reactions.find(r => r.user_id === userId)?.type : null;

      return {
        ...post,
        user: {
          ...post.user,
          profile: {
            ...post.user.profile,
            nickname: authorNicknames[post.user.id] || null,
          }
        },
        reactionCounts,
        userReaction,
        reactions: undefined, // hide raw reactions array
        comments: finalCommentsMap[post.id] || [],
      };
    });

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      hasMore: skip + posts.length < total,
    };
  }

  private async checkUserSanction(userId: string) {
    const sanctions: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT type, reason, ends_at FROM identity.user_sanctions 
       WHERE user_id = $1::uuid AND status = 'ACTIVE' AND (ends_at IS NULL OR ends_at > NOW()) LIMIT 1`,
      userId
    );
    if (sanctions && sanctions.length > 0) {
      const s = sanctions[0];
      const endStr = s.ends_at ? ` hasta el ${new Date(s.ends_at).toLocaleDateString()}` : ' de forma permanente';
      throw new ForbiddenException(
        `Tu cuenta se encuentra bajo sanción disciplinaria (${s.type})${endStr}. Motivo: "${s.reason}". Si consideras que es un error, puedes enviar una apelación desde tu perfil.`
      );
    }
  }

  async create(userId: string, data: CreatePostDto) {
    await this.checkUserSanction(userId);

    return this.prisma.post.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  }

  async createComment(userId: string, postId: string, data: CreateCommentDto) {
    await this.checkUserSanction(userId);

    if (!data.content && !data.media_url) {
      throw new BadRequestException('El comentario debe tener texto o una imagen.');
    }

    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post no encontrado');

    let rootParentId: string | null = null;
    if (data.parent_id) {
      // Check parent comment to enforce Instagram-style 1-level limit
      const parentCheck: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT id, parent_id FROM community.community_comments WHERE id = $1::uuid`,
        data.parent_id
      );
      if (parentCheck.length > 0) {
        // If the targeted comment is already a reply, anchor to its root parent!
        rootParentId = parentCheck[0].parent_id ? parentCheck[0].parent_id : parentCheck[0].id;
      }
    }

    const insertRes: any[] = await this.prisma.$queryRawUnsafe(
      `INSERT INTO community.community_comments (id, post_id, user_id, parent_id, content, media_url, created_at)
       VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3::uuid, $4, $5, NOW())
       RETURNING id, post_id, user_id, parent_id, content, media_url, created_at`,
      postId,
      userId,
      rootParentId,
      data.content || null,
      data.media_url || null
    );

    const newComment = insertRes[0];

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        profile: {
          select: {
            career: true,
            avatar_url: true,
          }
        }
      }
    });

    let commentNickname: string | null = null;
    try {
      const nicks: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT nickname FROM profile.user_profiles WHERE user_id = $1::uuid LIMIT 1`,
        userId
      );
      if (nicks.length > 0 && nicks[0].nickname) {
        commentNickname = nicks[0].nickname;
      }
    } catch (err) {
      // fallback
    }

    const userWithNick = user ? {
      ...user,
      profile: {
        ...user.profile,
        nickname: commentNickname,
      }
    } : null;

    return {
      ...newComment,
      user: userWithNick,
      reactionCounts: {},
      userReaction: null,
      replies: [],
    };
  }

  async reactToPost(userId: string, postId: string, data: ReactionDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post no encontrado');

    const existingReaction = await this.prisma.postReaction.findUnique({
      where: {
        post_id_user_id: { post_id: postId, user_id: userId }
      }
    });

    if (existingReaction) {
      if (existingReaction.type === data.type) {
        // Toggle off
        await this.prisma.postReaction.delete({ where: { id: existingReaction.id } });
        return { message: 'Reacción eliminada', action: 'REMOVED' };
      } else {
        // Change reaction
        const updated = await this.prisma.postReaction.update({
          where: { id: existingReaction.id },
          data: { type: data.type }
        });
        return { message: 'Reacción actualizada', action: 'UPDATED', reaction: updated };
      }
    } else {
      // Create reaction
      const newReaction = await this.prisma.postReaction.create({
        data: {
          type: data.type,
          post_id: postId,
          user_id: userId
        }
      });
      return { message: 'Reacción añadida', action: 'ADDED', reaction: newReaction };
    }
  }

  async reactToComment(userId: string, commentId: string, data: ReactionDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comentario no encontrado');

    const existing: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT id, type FROM community.community_comment_reactions WHERE comment_id = $1::uuid AND user_id = $2::uuid LIMIT 1`,
      commentId,
      userId
    );

    if (existing && existing.length > 0) {
      if (existing[0].type === data.type) {
        // Toggle off
        await this.prisma.$executeRawUnsafe(
          `DELETE FROM community.community_comment_reactions WHERE id = $1::uuid`,
          existing[0].id
        );
        return { message: 'Reacción eliminada', action: 'REMOVED' };
      } else {
        // Change reaction
        await this.prisma.$executeRawUnsafe(
          `UPDATE community.community_comment_reactions SET type = $1 WHERE id = $2::uuid`,
          data.type,
          existing[0].id
        );
        return { message: 'Reacción actualizada', action: 'UPDATED' };
      }
    } else {
      // Create reaction
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO community.community_comment_reactions (id, comment_id, user_id, type, created_at) VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, NOW())`,
        commentId,
        userId,
        data.type
      );
      return { message: 'Reacción añadida', action: 'ADDED' };
    }
  }

  async deletePost(userId: string, postId: string, userRole?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Publicación no encontrada.');
    }

    const isAdminOrOrganizer = userRole === 'ADMIN' || userRole === 'ORGANIZER';
    const isAuthor = post.user_id === userId;

    if (!isAuthor && !isAdminOrOrganizer) {
      throw new ForbiddenException('No tienes permisos para eliminar esta publicación.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `DELETE FROM community.community_comment_reactions WHERE comment_id IN (SELECT id FROM community.community_comments WHERE post_id = $1::uuid)`,
        postId
      );
      await tx.postReaction.deleteMany({ where: { post_id: postId } });
      await tx.comment.deleteMany({ where: { post_id: postId } });
      await tx.post.delete({ where: { id: postId } });
    });

    return { message: 'Publicación eliminada correctamente.' };
  }
}

