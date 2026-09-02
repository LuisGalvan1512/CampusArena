import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { LinkGameDto, VerifyGameTagDto } from './dto/link-game.dto.js';
import { SupercellAdapterService } from './services/supercell-adapter.service.js';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supercellAdapter: SupercellAdapterService,
  ) {}

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

    return {
      ...user,
      profile: {
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
      legacy_summary: {
        tournaments_played: 12,
        championships: 2,
        match_wins: 34,
        match_losses: 8,
        win_rate: 80.9,
        medals_count: 5,
      },
    };
  }

  /**
   * PATCH /profile/me
   * Updates editable profile fields.
   */
  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    const existingProfile = await this.prisma.userProfile.findUnique({
      where: { user_id: userId },
    });

    if (!existingProfile) {
      const profile = await this.prisma.userProfile.create({
        data: {
          user_id: userId,
          ...dto,
        },
      });
      return this.formatProfile(profile);
    }

    const profile = await this.prisma.userProfile.update({
      where: { user_id: userId },
      data: dto,
    });

    return this.formatProfile(profile);
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

  private formatProfile(profile: {
    biography: string | null;
    career: string | null;
    cycle: number | null;
    avatar_url: string | null;
  }) {
    return {
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
    };
    return names[code] ?? code;
  }
}
