import { PartialType } from '@nestjs/swagger';
import { CreateTournamentDto } from './create-tournament.dto.js';
import { IsOptional, IsEnum, IsString } from 'class-validator';

export enum TournamentStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REGISTRATION_OPEN = 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED = 'REGISTRATION_CLOSED',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export class UpdateTournamentDto extends PartialType(CreateTournamentDto) {
  @IsOptional()
  @IsEnum(TournamentStatusEnum, { message: 'Estado del torneo no válido.' })
  status?: TournamentStatusEnum;
}
