import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsNumber,
  IsBoolean,
  IsEmail,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TournamentGame {
  CLASH_ROYALE = 'CLASH_ROYALE',
  BRAWL_STARS = 'BRAWL_STARS',
  SMASH_ULTIMATE = 'SMASH_ULTIMATE',
  LEFT_4_DEAD_2 = 'LEFT_4_DEAD_2',
  EFOOTBALL = 'EFOOTBALL',
  DOTA_2 = 'DOTA_2',
}

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del torneo es obligatorio.' })
  @MaxLength(150, { message: 'El nombre no puede tener más de 150 caracteres.' })
  name: string;

  @IsEnum(TournamentGame, {
    message: 'El juego seleccionado no es válido.',
  })
  @IsNotEmpty({ message: 'El código del juego es obligatorio.' })
  game_code: TournamentGame;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  organization_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  campus_name?: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción corta es obligatoria.' })
  @MaxLength(250)
  description_short: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción completa es obligatoria.' })
  description_full: string;

  @IsString()
  @IsNotEmpty({ message: 'La URL del banner es obligatoria.' })
  banner_url: string;

  @IsString()
  @IsNotEmpty({ message: 'El reglamento oficial es obligatorio.' })
  rules_text: string;

  @IsInt({ message: 'El cupo máximo debe ser un número entero.' })
  @Min(2, { message: 'El cupo máximo mínimo es 2.' })
  @Type(() => Number)
  max_slots: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Type(() => Number)
  min_slots?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  @IsNotEmpty({ message: 'El pozo de premios es obligatorio.' })
  prize_pool: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsDateString({}, { message: 'La fecha de apertura de registros no es válida.' })
  registration_open_at: string;

  @IsDateString({}, { message: 'La fecha de cierre de registros no es válida.' })
  registration_close_at: string;

  @IsDateString({}, { message: 'La fecha de inicio del torneo no es válida.' })
  tournament_start_at: string;

  @IsOptional()
  @IsBoolean()
  is_online?: boolean;

  @IsEmail({}, { message: 'El correo de contacto no tiene formato válido.' })
  contact_email: string;
}
