import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { ReactionDto } from './dto/reaction.dto.js';

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string, userId?: string) {
    const whereClause = category && category !== 'ALL' ? { category } : {};
    
    const posts = await this.prisma.post.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
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
        reactions: true, // We will map this to grouped counts
        comments: {
          orderBy: { created_at: 'asc' },
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                profile: {
                  select: { career: true, avatar_url: true }
                }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return posts.map(post => {
      // Calculate reactions
      const reactionCounts = post.reactions.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // User reaction
      const userReaction = userId ? post.reactions.find(r => r.user_id === userId)?.type : null;

      return {
        ...post,
        reactionCounts,
        userReaction,
        reactions: undefined // hide raw reactions array
      };
    });
  }

  async create(userId: string, data: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  }

  async createComment(userId: string, postId: string, data: CreateCommentDto) {
    if (!data.content && !data.media_url) {
      throw new BadRequestException('El comentario debe tener texto o una imagen.');
    }

    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post no encontrado');

    return this.prisma.comment.create({
      data: {
        content: data.content,
        media_url: data.media_url,
        user_id: userId,
        post_id: postId,
      },
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            profile: {
              select: { career: true, avatar_url: true }
            }
          }
        }
      }
    });
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
}
