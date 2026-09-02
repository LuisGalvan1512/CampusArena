import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ReviewDecision {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REQUEST_CORRECTION = 'REQUEST_CORRECTION',
}

export class ReviewPaymentDto {
  @IsEnum(ReviewDecision, {
    message: 'La decisión debe ser APPROVE, REJECT o REQUEST_CORRECTION.',
  })
  @IsNotEmpty({ message: 'La decisión es obligatoria.' })
  decision: ReviewDecision;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  public_observation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  internal_observation?: string;
}
