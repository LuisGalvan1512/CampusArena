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
  // ============================================================
  // AUTONOMOUS PROFILE RESOLUTION (No external fake stats)
  // ============================================================

  private generateSimulatedProfile(
    gameCode: GameCode,
    tag: string
  ): VerifiedPlayerProfile {
    return {
      game_code: gameCode,
      game_name: GAME_NAMES[gameCode] || gameCode,
      player_tag: tag,
      in_game_name: tag,
      trophies: 0,
      level: 0,
      arena_or_club: 'Competidor Oficial Tecsup',
    };
  }
}
