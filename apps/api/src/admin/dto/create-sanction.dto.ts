import { IsNotEmpty, IsString, IsIn, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateSanctionDto {
  @IsNotEmpty({ message: 'El tipo de sanción es obligatorio.' })
  @IsIn(['MUTE', 'BAN_TEMPORARY', 'BAN_PERMANENT'], {
    message: 'El tipo debe ser MUTE, BAN_TEMPORARY o BAN_PERMANENT.',
  })
  type: 'MUTE' | 'BAN_TEMPORARY' | 'BAN_PERMANENT';

  @IsNotEmpty({ message: 'El motivo de la sanción es obligatorio.' })
  @IsString()
  reason: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'La duración mínima es de 1 día.' })
  @Max(365, { message: 'La duración máxima es de 365 días.' })
  duration_days?: number;
}

export class RevokeSanctionDto {
  @IsOptional()
  @IsString()
  revoke_reason?: string;
}
