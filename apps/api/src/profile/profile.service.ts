import { 
  Injectable, 
  ConflictException, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException,
  OnModuleInit
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { LinkGameDto, VerifyGameTagDto } from './dto/link-game.dto.js';
import { SupercellAdapterService } from './services/supercell-adapter.service.js';

@Injectable()
export class ProfileService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supercellAdapter: SupercellAdapterService,
  ) {}

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS profile.profile_signatures (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          profile_user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
          author_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP(6) DEFAULT now()
        );
      `);
      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_profile_signatures_profile_user_id ON profile.profile_signatures(profile_user_id);
      `);
    } catch (err) {
      console.error('[ProfileService onModuleInit signatures error]:', err);
    }
  }

  /**
   * GET /profile/me
   * Returns the profile of the authenticated user with linked game accounts.
   */
  async getMyProfile(userId: string) {
    let profile = await this.prisma.userProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      profile = await this.prisma.userProfile.create({
        data: { user_id: userId },
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        email_verified: true,
        created_at: true,
      },
    });

    const gameProfiles = await this.prisma.gameProfile.findMany({
      where: { user_id: userId },
      orderBy: { synced_at: 'desc' },
    });

    const medals = await this.calculateUserMedals(userId);

    const goldCount = medals.filter((m) => m.medal_type === 'GOLD').length;
    const silverCount = medals.filter((m) => m.medal_type === 'SILVER').length;
    const bronzeCount = medals.filter((m) => m.medal_type === 'BRONZE').length;
    const totalMedals = goldCount + silverCount + bronzeCount;

    let userNickname: string | null = null;
    let userCampus: string = 'Lima';
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT nickname, campus FROM profile.user_profiles WHERE user_id = $1::uuid LIMIT 1`,
        userId
      );
      if (rows.length > 0) {
        if (rows[0].nickname) userNickname = rows[0].nickname;
        if (rows[0].campus) userCampus = rows[0].campus;
      }
    } catch (err) {}

    return {
      ...user,
      profile: {
        nickname: userNickname ?? (profile as any).nickname ?? null,
        campus: userCampus ?? (profile as any).campus ?? 'Lima',
        biography: profile.biography,
        career: profile.career,
        cycle: profile.cycle,
        avatar_url: profile.avatar_url,
      },
      game_profiles: gameProfiles.map((gp) => ({
        id: gp.id,
        game_code: gp.game_code,
        game_name: this.getGameName(gp.game_code),
        player_tag: gp.player_tag,
        in_game_name: gp.in_game_name,
        trophies: gp.trophies,
        level: gp.level,
        extra_data: (gp as any).extra_data ?? null,
        synced_at: gp.synced_at,
      })),
      medals,
      legacy_summary: {
        tournaments_played: medals.length,
        championships: goldCount,
        silver_medals: silverCount,
        bronze_medals: bronzeCount,
        total_medals: totalMedals,
      },
    };
  }

  /**
   * GET /profile/:id
   * Returns public profile and dynamic medals of any competitor.
   */
  async getProfileById(targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        created_at: true,
        profile: {
          select: {
            biography: true,
            career: true,
            cycle: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    let targetNickname: string | null = null;
    let targetCampus: string = 'Lima';
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT nickname, campus FROM profile.user_profiles WHERE user_id = $1::uuid LIMIT 1`,
        targetUserId
      );
      if (rows.length > 0) {
        if (rows[0].nickname) targetNickname = rows[0].nickname;
        if (rows[0].campus) targetCampus = rows[0].campus;
      }
    } catch (err) {}

    const activeRegistrations = await this.prisma.registration.findMany({
      where: {
        competitor_id: targetUserId,
        status: { in: ['CONFIRMED', 'PENDING_PAYMENT', 'PAYMENT_UNDER_REVIEW'] },
        tournament: {
          status: { notIn: ['FINISHED', 'CANCELLED'] },
          deleted_at: null,
        },
      },
      include: {
        tournament: true,
      },
      orderBy: {
        tournament: { tournament_start_at: 'asc' },
      },
    });

    const active_tournaments = activeRegistrations.map((reg) => ({
      id: reg.tournament.id,
      name: reg.tournament.name,
      slug: reg.tournament.slug,
      game_code: reg.tournament.game_code,
      banner_url: reg.tournament.banner_url,
      tournament_start_at: reg.tournament.tournament_start_at,
      prize_pool: reg.tournament.prize_pool,
      status: reg.tournament.status,
      team_name: reg.team_name,
      registration_status: reg.status,
    }));

    const medals = await this.calculateUserMedals(targetUserId);

    const goldCount = medals.filter((m) => m.medal_type === 'GOLD').length;
    const silverCount = medals.filter((m) => m.medal_type === 'SILVER').length;
    const bronzeCount = medals.filter((m) => m.medal_type === 'BRONZE').length;

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      created_at: user.created_at,
      profile: user.profile ? {
        ...user.profile,
        nickname: targetNickname,
        campus: targetCampus,
      } : {
        nickname: targetNickname,
        campus: targetCampus,
        biography: '',
        career: 'Diseño y Desarrollo de Software',
        cycle: 1,
        avatar_url: null,
      },
      game_profiles: [],
      active_tournaments,
      medals,
      legacy_summary: {
        tournaments_played: medals.length,
        championships: goldCount,
        silver_medals: silverCount,
        bronze_medals: bronzeCount,
        total_medals: goldCount + silverCount + bronzeCount,
      },
    };
  }

  /**
   * Calculates dynamic medals from finished tournaments only (status === 'FINISHED').
   * If tournament is still in-progress or open, NO medal is awarded.
   */
  async calculateUserMedals(userId: string) {
    const registrations = await this.prisma.registration.findMany({
      where: {
        competitor_id: userId,
        status: 'CONFIRMED',
        tournament: {
          status: 'FINISHED',
          deleted_at: null,
        },
      },
      include: {
        game_profile: true,
        tournament: {
          include: {
            competition: {
              include: {
                rounds: {
                  orderBy: { round_number: 'desc' },
                  include: {
                    matchups: {
                      orderBy: { position: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        tournament: { tournament_start_at: 'desc' },
      },
    });

    const medals: any[] = [];

    for (const reg of registrations) {
      const tour = reg.tournament;
      const comp = tour.competition;
      const playerTag = reg.game_profile?.player_tag;
      const teamName = reg.team_name;

      if (!comp || !comp.rounds || comp.rounds.length === 0) {
        medals.push({
          id: `${tour.id}-${reg.id}`,
          tournament_id: tour.id,
          tournament_name: tour.name,
          tournament_slug: tour.slug,
          game_code: tour.game_code,
          campus_name: tour.campus_name,
          banner_url: tour.banner_url,
          completed_at: tour.updated_at,
          place: 'Participante Oficial',
          rank: 4,
          medal_type: 'PARTICIPANT',
          title: 'Mención de Participación',
          emoji: '🛡️',
          badge_color: 'emerald',
        });
        continue;
      }

      const matchesPlayer = (tag?: string | null, name?: string | null) => {
        if (!tag && !name) return false;
        if (playerTag && tag && (tag === playerTag || tag.includes(playerTag))) return true;
        if (teamName && name && (name === teamName || name.includes(teamName))) return true;
        return false;
      };

      const rounds = comp.rounds; // rounds[0] is Gran Final, rounds[1] is Semifinales
      const finalRound = rounds[0];
      const semiRound = rounds.length > 1 ? rounds[1] : null;

      let awarded = false;

      // 1. Gran Final (Oro y Plata)
      if (finalRound && finalRound.matchups && finalRound.matchups.length > 0) {
        const finalMatch = finalRound.matchups[0];
        const isFinalWinner = matchesPlayer(finalMatch.winner_tag, finalMatch.winner_name);
        const isInFinal = matchesPlayer(finalMatch.participant_a_tag, finalMatch.participant_a_name) ||
                          matchesPlayer(finalMatch.participant_b_tag, finalMatch.participant_b_name);

        if (isFinalWinner) {
          medals.push({
            id: `${tour.id}-${reg.id}`,
            tournament_id: tour.id,
            tournament_name: tour.name,
            tournament_slug: tour.slug,
            game_code: tour.game_code,
            campus_name: tour.campus_name,
            banner_url: tour.banner_url,
            completed_at: tour.updated_at,
            place: '1er Lugar',
            rank: 1,
            medal_type: 'GOLD',
            title: 'Campeón Oficial',
            emoji: '🥇',
            badge_color: 'amber',
          });
          awarded = true;
        } else if (isInFinal) {
          medals.push({
            id: `${tour.id}-${reg.id}`,
            tournament_id: tour.id,
            tournament_name: tour.name,
            tournament_slug: tour.slug,
            game_code: tour.game_code,
            campus_name: tour.campus_name,
            banner_url: tour.banner_url,
            completed_at: tour.updated_at,
            place: '2do Lugar',
            rank: 2,
            medal_type: 'SILVER',
            title: 'Subcampeón',
            emoji: '🥈',
            badge_color: 'slate',
          });
          awarded = true;
        }
      }

      // 2. Semifinales (Bronce)
      if (!awarded && semiRound && semiRound.matchups) {
        const playedInSemis = semiRound.matchups.some((m) =>
          matchesPlayer(m.participant_a_tag, m.participant_a_name) ||
          matchesPlayer(m.participant_b_tag, m.participant_b_name)
        );

        if (playedInSemis) {
          medals.push({
            id: `${tour.id}-${reg.id}`,
            tournament_id: tour.id,
            tournament_name: tour.name,
            tournament_slug: tour.slug,
            game_code: tour.game_code,
            campus_name: tour.campus_name,
            banner_url: tour.banner_url,
            completed_at: tour.updated_at,
            place: '3er Lugar',
            rank: 3,
            medal_type: 'BRONZE',
            title: 'Podio de Bronce',
            emoji: '🥉',
            badge_color: 'orange',
          });
          awarded = true;
        }
      }

      // 3. Cuartos de Final (Top 8)
      if (!awarded && rounds.length > 2) {
        const cuartosRound = rounds[2];
        const playedInCuartos = cuartosRound.matchups.some((m) =>
          matchesPlayer(m.participant_a_tag, m.participant_a_name) ||
          matchesPlayer(m.participant_b_tag, m.participant_b_name)
        );

        if (playedInCuartos) {
          medals.push({
            id: `${tour.id}-${reg.id}`,
            tournament_id: tour.id,
            tournament_name: tour.name,
            tournament_slug: tour.slug,
            game_code: tour.game_code,
            campus_name: tour.campus_name,
            banner_url: tour.banner_url,
            completed_at: tour.updated_at,
            place: 'Top 8',
            rank: 4,
            medal_type: 'HONOR',
            title: 'Cuartofinalista Destacado',
            emoji: '🎖️',
            badge_color: 'blue',
          });
          awarded = true;
        }
      }

      // 4. Default si no llegó a rondas altas
      if (!awarded) {
        medals.push({
          id: `${tour.id}-${reg.id}`,
          tournament_id: tour.id,
          tournament_name: tour.name,
          tournament_slug: tour.slug,
          game_code: tour.game_code,
          campus_name: tour.campus_name,
          banner_url: tour.banner_url,
          completed_at: tour.updated_at,
          place: 'Participante Oficial',
          rank: 5,
          medal_type: 'PARTICIPANT',
          title: 'Mención de Participación',
          emoji: '🛡️',
          badge_color: 'emerald',
        });
      }
    }

    return medals;
  }

  /**
   * PATCH /profile/me
   * Updates editable profile fields.
   */
  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const { nickname, campus, ...restDto } = dto;

    if (nickname !== undefined) {
      try {
        await this.prisma.$executeRawUnsafe(
          `UPDATE profile.user_profiles SET nickname = $1 WHERE user_id = $2::uuid`,
          nickname || null,
          userId
        );
      } catch (err) {}
    }

    if (campus !== undefined) {
      try {
        await this.prisma.$executeRawUnsafe(
          `UPDATE profile.user_profiles SET campus = $1 WHERE user_id = $2::uuid`,
          campus || 'Lima',
          userId
        );
      } catch (err) {}
    }

    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { user_id: userId },
    });

    if (restDto.avatar_url !== undefined) {
      const cleanAvatar = restDto.avatar_url ? restDto.avatar_url.trim() : null;
      restDto.avatar_url = cleanAvatar as any;
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: { avatar_url: cleanAvatar },
        });
      } catch (err) {}
    }

    let profile: any;
    if (!existingProfile) {
      profile = await this.prisma.userProfile.create({
        data: {
          user_id: userId,
          ...restDto,
        },
      });
    } else {
      profile = await this.prisma.userProfile.update({
        where: { user_id: userId },
        data: restDto,
      });
    }

    let savedNickname: string | null = null;
    let savedCampus: string = 'Lima';
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT nickname, campus FROM profile.user_profiles WHERE user_id = $1::uuid LIMIT 1`,
        userId
      );
      if (rows.length > 0) {
        if (rows[0].nickname) savedNickname = rows[0].nickname;
        if (rows[0].campus) savedCampus = rows[0].campus;
      }
    } catch (err) {}

    return {
      ...this.formatProfile(profile),
      nickname: savedNickname ?? (profile as any).nickname ?? null,
      campus: savedCampus ?? (profile as any).campus ?? 'Lima',
    };
  }

  /**
   * POST /profile/games/verify
   * Verifies tag with Supercell and returns live preview before linking.
   */
  async verifyGameTag(dto: VerifyGameTagDto) {
    return this.supercellAdapter.verifyPlayer(dto.game_code, dto.player_tag, dto.extra_data);
  }

  /**
   * POST /profile/games
   * Links a Supercell Player Tag to the user's competitor profile.
   * Business rule: RN-201 (Uniqueness per game).
   */
  async linkGame(userId: string, dto: LinkGameDto) {
    // 1. Verify tag with Supercell adapter
    const verified = await this.supercellAdapter.verifyPlayer(dto.game_code, dto.player_tag, dto.extra_data);

    // 2. Check if this tag is already linked by another user (RN-201)
    const existingTag = await this.prisma.gameProfile.findUnique({
      where: {
        game_code_player_tag: {
          game_code: verified.game_code,
          player_tag: verified.player_tag,
        },
      },
    });

    if (existingTag && existingTag.user_id !== userId) {
      throw new ConflictException(
        `El Player Tag ${verified.player_tag} ya está vinculado a otra cuenta de competidor.`
      );
    }

    // 3. Upsert user's account for this game (1 account per game)
    const gameProfile = await this.prisma.gameProfile.upsert({
      where: {
        user_id_game_code: {
          user_id: userId,
          game_code: verified.game_code,
        },
      },
      update: {
        player_tag: verified.player_tag,
        in_game_name: verified.in_game_name,
        trophies: verified.trophies,
        level: verified.level,
        extra_data: (verified.extra_data as any) ?? undefined,
        synced_at: new Date(),
      },
      create: {
        user_id: userId,
        game_code: verified.game_code,
        player_tag: verified.player_tag,
        in_game_name: verified.in_game_name,
        trophies: verified.trophies,
        level: verified.level,
        extra_data: (verified.extra_data as any) ?? undefined,
      },
    });

    return {
      message: `Cuenta de ${verified.game_name} vinculada exitosamente con el apodo "${verified.in_game_name}".`,
      game_profile: {
        id: gameProfile.id,
        game_code: gameProfile.game_code,
        game_name: verified.game_name,
        player_tag: gameProfile.player_tag,
        in_game_name: gameProfile.in_game_name,
        trophies: gameProfile.trophies,
        level: gameProfile.level,
        synced_at: gameProfile.synced_at,
      },
    };
  }

  /**
   * DELETE /profile/games/:id
   * Unlinks a game account.
   */
  async unlinkGame(userId: string, gameProfileId: string) {
    const existing = await this.prisma.gameProfile.findUnique({
      where: { id: gameProfileId },
    });

    if (!existing || existing.user_id !== userId) {
      throw new NotFoundException('La cuenta de juego no existe o no pertenece a tu perfil.');
    }

    await this.prisma.gameProfile.delete({
      where: { id: gameProfileId },
    });

    return { message: 'Cuenta de juego desvinculada exitosamente.' };
  }

  private formatProfile(profile: any) {
    return {
      nickname: profile.nickname ?? null,
      campus: profile.campus ?? 'Lima',
      biography: profile.biography,
      career: profile.career,
      cycle: profile.cycle,
      avatar_url: profile.avatar_url,
    };
  }

  private getGameName(code: string): string {
    const names: Record<string, string> = {
      CLASH_ROYALE: 'Clash Royale',
      BRAWL_STARS: 'Brawl Stars',
      SMASH_ULTIMATE: 'Super Smash Bros',
      LEFT_4_DEAD_2: 'Left 4 Dead 2',
      EFOOTBALL: 'eFootball',
      DOTA_2: 'Dota 2',
      FORTNITE: 'Fortnite',
    };
    return names[code] ?? code;
  }

  /**
   * GET /profile/me/sanctions
   * Returns active sanctions on the competitor and their appeal statuses.
   */
  async getMySanctions(userId: string) {
    const [sanctions, appeals] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id, type, reason, starts_at, ends_at, status, created_at
         FROM identity.user_sanctions
         WHERE user_id = $1::uuid AND status = 'ACTIVE' AND (ends_at IS NULL OR ends_at > NOW())
         ORDER BY created_at DESC`,
        userId
      ),
      this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id, sanction_id, appeal_text, status, admin_response, reviewed_at, created_at
         FROM identity.sanction_appeals
         WHERE user_id = $1::uuid
         ORDER BY created_at DESC`,
        userId
      ),
    ]);

    return {
      active_sanctions: sanctions,
      appeals,
    };
  }

  /**
   * POST /profile/me/appeals
   * Submits an appeal for an active sanction.
   */
  async submitAppeal(userId: string, dto: { sanction_id: string; appeal_text: string }) {
    // 1. Verify sanction belongs to user and is ACTIVE
    const sanctions: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT id, type, reason, status FROM identity.user_sanctions 
       WHERE id = $1::uuid AND user_id = $2::uuid AND status = 'ACTIVE'`,
      dto.sanction_id,
      userId
    );

    if (!sanctions || sanctions.length === 0) {
      throw new NotFoundException('No se encontró una sanción activa correspondiente a este identificador.');
    }

    // 2. Check if an appeal is already pending
    const existing: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT id FROM identity.sanction_appeals WHERE sanction_id = $1::uuid AND status = 'PENDING'`,
      dto.sanction_id
    );

    if (existing && existing.length > 0) {
      throw new BadRequestException('Ya has enviado una apelación que se encuentra pendiente de revisión.');
    }

    // 3. Insert appeal
    const res: any[] = await this.prisma.$queryRawUnsafe(
      `INSERT INTO identity.sanction_appeals (id, sanction_id, user_id, appeal_text, status, created_at)
       VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, 'PENDING', NOW())
       RETURNING *`,
      dto.sanction_id,
      userId,
      dto.appeal_text
    );

    return {
      message: 'Tu solicitud de apelación ha sido enviada al equipo administrativo.',
      appeal: res[0],
    };
  }

  /**
   * GET /profile/:id/signatures
   * Returns signatures left on a competitor's profile wall.
   */
  async getSignatures(profileUserId: string) {
    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(`
        SELECT 
          s.id,
          s.content,
          s.image_url,
          s.created_at,
          s.author_id,
          u.first_name,
          u.last_name,
          u.email,
          p.nickname,
          p.avatar_url,
          p.campus
        FROM profile.profile_signatures s
        JOIN identity.users u ON u.id = s.author_id
        LEFT JOIN profile.user_profiles p ON p.user_id = s.author_id
        WHERE s.profile_user_id = $1::uuid
        ORDER BY s.created_at DESC
        LIMIT 50
      `, profileUserId);

      return rows.map((r) => ({
        id: r.id,
        content: r.content,
        image_url: r.image_url,
        created_at: r.created_at,
        author: {
          id: r.author_id,
          first_name: r.first_name,
          last_name: r.last_name,
          nickname: r.nickname || null,
          email: r.email,
          avatar_url: r.avatar_url || null,
          campus: r.campus || 'Lima',
        },
      }));
    } catch (err) {
      return [];
    }
  }

  /**
   * POST /profile/:id/signatures
   * Leaves a signature or comment on a user's profile wall.
   */
  async createSignature(profileUserId: string, authorId: string, content: string, imageUrl?: string) {
    if ((!content || !content.trim()) && (!imageUrl || !imageUrl.trim())) {
      throw new BadRequestException('La firma debe contener un mensaje o una imagen.');
    }

    const targetUser = await this.prisma.user.findUnique({ where: { id: profileUserId } });
    if (!targetUser) {
      throw new NotFoundException('El usuario de destino no fue encontrado.');
    }

    const rows: any[] = await this.prisma.$queryRawUnsafe(`
      INSERT INTO profile.profile_signatures (profile_user_id, author_id, content, image_url)
      VALUES ($1::uuid, $2::uuid, $3, $4)
      RETURNING id, profile_user_id, author_id, content, image_url, created_at
    `, profileUserId, authorId, content?.trim() || '', imageUrl?.trim() || null);

    const inserted = rows[0];

    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        profile: {
          select: {
            nickname: true,
            avatar_url: true,
            campus: true,
          },
        },
      },
    });

    return {
      id: inserted.id,
      content: inserted.content,
      image_url: inserted.image_url,
      created_at: inserted.created_at,
      author: {
        id: author?.id || authorId,
        first_name: author?.first_name || 'Usuario',
        last_name: author?.last_name || '',
        nickname: author?.profile?.nickname || null,
        email: author?.email || '',
        avatar_url: author?.profile?.avatar_url || null,
        campus: author?.profile?.campus || 'Lima',
      },
    };
  }

  /**
   * DELETE /profile/signatures/:id
   * Deletes a signature (allowed for author or profile owner).
   */
  async deleteSignature(signatureId: string, currentUserId: string) {
    const rows: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT id, profile_user_id, author_id FROM profile.profile_signatures WHERE id = $1::uuid LIMIT 1
    `, signatureId);

    if (!rows || rows.length === 0) {
      throw new NotFoundException('Firma no encontrada.');
    }

    const sig = rows[0];
    if (sig.author_id !== currentUserId && sig.profile_user_id !== currentUserId) {
      throw new ForbiddenException('No tienes permisos para eliminar esta firma.');
    }

    await this.prisma.$executeRawUnsafe(`
      DELETE FROM profile.profile_signatures WHERE id = $1::uuid
    `, signatureId);

    return { message: 'Firma eliminada exitosamente.' };
  }
}

