import { IsEnum, IsNotEmpty, IsString, MaxLength, IsOptional, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SupportedGame {
  CLASH_ROYALE = 'CLASH_ROYALE',
  BRAWL_STARS = 'BRAWL_STARS',
  SMASH_ULTIMATE = 'SMASH_ULTIMATE',
  LEFT_4_DEAD_2 = 'LEFT_4_DEAD_2',
  EFOOTBALL = 'EFOOTBALL',
  DOTA_2 = 'DOTA_2',
}

export class VerifyGameTagDto {
  @IsEnum(SupportedGame, {
    message: 'El juego seleccionado no es válido.',
  })
  @IsNotEmpty({ message: 'El juego es obligatorio.' })
  game_code: SupportedGame;

  @IsString()
  @IsNotEmpty({ message: 'El Player Tag / ID de usuario es obligatorio.' })
  @MaxLength(100, { message: 'El identificador no puede tener más de 100 caracteres.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  player_tag: string;

  @IsOptional()
  @IsObject()
  extra_data?: Record<string, unknown>;
}

export class LinkGameDto extends VerifyGameTagDto {}
