import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TournamentGame } from './create-tournament.dto.js';

export enum TournamentStatusFilter {
  ALL = 'ALL',
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export class QueryTournamentDto {
  @IsOptional()
  @IsEnum(TournamentGame)
  game_code?: TournamentGame;

  @IsOptional()
  @IsEnum(TournamentStatusFilter)
  status?: TournamentStatusFilter;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
