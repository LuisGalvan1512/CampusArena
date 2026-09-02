import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type GameCode = 'CLASH_ROYALE' | 'BRAWL_STARS' | 'SMASH_ULTIMATE' | 'LEFT_4_DEAD_2' | 'EFOOTBALL' | 'DOTA_2';

export interface VerifiedPlayerProfile {
  game_code: GameCode;
  game_name: string;
  player_tag: string;
  in_game_name: string;
  trophies: number;
  level: number;
  arena_or_club: string;
  extra_data?: Record<string, unknown>;
}

const GAME_NAMES: Record<GameCode, string> = {
  CLASH_ROYALE: 'Clash Royale',
  BRAWL_STARS: 'Brawl Stars',
  SMASH_ULTIMATE: 'Super Smash Bros',
  LEFT_4_DEAD_2: 'Left 4 Dead 2',
  EFOOTBALL: 'eFootball',
  DOTA_2: 'Dota 2',
};

@Injectable()
export class SupercellAdapterService {
  constructor(private readonly config: ConfigService) {}

  /**
   * Normaliza cualquier Nickname o Tag de jugador, asegurándose de que tenga una longitud válida.
   * Sistema 100% autónomo: acepta cualquier nombre sin reglas estrictas de API.
   */
  normalizeTag(rawTag: string): string {
    if (!rawTag) {
      throw new BadRequestException('El Player Tag o Nickname es obligatorio.');
    }

    const cleaned = rawTag.trim();

    if (cleaned.length < 2 || cleaned.length > 50) {
      throw new BadRequestException('El Nickname debe tener entre 2 y 50 caracteres.');
    }

    return cleaned;
  }

  /**
   * Verifica la cuenta procesando el Nickname.
   * Como el sistema ahora es "Stateless" y no depende de APIs externas, siempre generará
   * un perfil simulado o manual válido automáticamente.
   */
  async verifyPlayer(
    gameCode: GameCode,
    rawTag: string,
    extraData?: Record<string, unknown>,
  ): Promise<VerifiedPlayerProfile> {
    const formattedTag = this.normalizeTag(rawTag);
    
    switch (gameCode) {
      case 'CLASH_ROYALE':
      case 'BRAWL_STARS':
      case 'LEFT_4_DEAD_2':
      case 'DOTA_2':
        return this.generateSimulatedProfile(gameCode, formattedTag);

      case 'SMASH_ULTIMATE':
      case 'EFOOTBALL':
        return this.createManualProfile(gameCode, formattedTag, extraData);

      default:
        throw new BadRequestException(`Juego no soportado: ${gameCode}`);
    }
  }

  // ============================================================
  // MANUAL PROFILE — Smash Bros, eFootball
  // ============================================================

  private createManualProfile(
    gameCode: GameCode,
    username: string,
    extraData?: Record<string, unknown>,
  ): VerifiedPlayerProfile {
    return {
      game_code: gameCode,
      game_name: GAME_NAMES[gameCode],
      player_tag: username,
      in_game_name: username,
      trophies: 0,
      level: 0,
      arena_or_club: gameCode === 'SMASH_ULTIMATE'
        ? `Main: ${(extraData?.main_character as string) || 'No especificado'}`
        : `Equipo: ${(extraData?.team_name as string) || 'No especificado'}`,
      extra_data: extraData,
    };
  }

  // ============================================================
  // DETERMINISTIC SIMULATED PROFILES (for development)
  // ============================================================

  private generateSimulatedProfile(
    gameCode: GameCode,
    tag: string
  ): VerifiedPlayerProfile {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);

    // Evitamos el slice para tags muy cortos
    const shortTag = tag.length > 3 ? tag.slice(0, 4) : tag;

    switch (gameCode) {
      case 'CLASH_ROYALE': {
        const names = ['Luis_CR', 'ArenaKing', 'ElectroMaster', 'PekkaPro', 'GoblinsGod', 'RoyaleChamp'];
        const name = names[absHash % names.length];
        return {
          game_code: 'CLASH_ROYALE',
          game_name: 'Clash Royale',
          player_tag: tag,
          in_game_name: `${name}_${shortTag}`,
          trophies: 5000 + (absHash % 4000),
          level: 12 + (absHash % 4),
          arena_or_club: 'Arena Legendaria (Liga Campeones)',
        };
      }

      case 'BRAWL_STARS': {
        const names = ['BrawlStar_01', 'MortisGod', 'ColtSniper', 'CrowPoison', 'LeonStealth', 'ShellyBlast'];
        const name = names[absHash % names.length];
        return {
          game_code: 'BRAWL_STARS',
          game_name: 'Brawl Stars',
          player_tag: tag,
          in_game_name: `${name}_${shortTag}`,
          trophies: 15000 + (absHash % 25000),
          level: 80 + (absHash % 60),
          arena_or_club: 'Campus Stars Club',
        };
      }

      case 'LEFT_4_DEAD_2': {
        const names = ['Survivor_Luis', 'ZombieSlayer', 'L4D_Pro', 'InfectedHunter', 'TankKiller', 'CoachMain'];
        const name = names[absHash % names.length];
        const hours = 100 + (absHash % 2000);
        return {
          game_code: 'LEFT_4_DEAD_2',
          game_name: 'Left 4 Dead 2',
          player_tag: tag,
          in_game_name: name,
          trophies: hours, // hours played
          level: 0,
          arena_or_club: 'Steam Player',
          extra_data: { hours_played: hours, steam_url: `https://steamcommunity.com/profiles/${tag}` },
        };
      }

      case 'DOTA_2': {
        const names = ['Miracle', 'Arteezy', 'Puppey', 'KuroKy', 'Dendi', 'Topson'];
        const name = names[absHash % names.length];
        const mmr = 2000 + (absHash % 7000); // 2k to 9k MMR
        return {
          game_code: 'DOTA_2',
          game_name: 'Dota 2',
          player_tag: tag,
          in_game_name: `${name}_${shortTag}`,
          trophies: mmr, // using trophies for MMR
          level: 50 + (absHash % 100),
          arena_or_club: 'Steam / Dota 2',
          extra_data: { mmr, steam_url: `https://steamcommunity.com/profiles/${tag}` },
        };
      }

      default:
        return {
          game_code: gameCode,
          game_name: GAME_NAMES[gameCode],
          player_tag: tag,
          in_game_name: tag,
          trophies: 0,
          level: 0,
          arena_or_club: 'Registro Autónomo',
        };
    }
  }
}
