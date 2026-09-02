import { IsInt, Min, Max, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class SubmitMatchupResultDto {
  @IsInt()
  @Min(0)
  @Max(3)
  score_a: number;

  @IsInt()
  @Min(0)
  @Max(3)
  score_b: number;

  @IsString()
  @IsNotEmpty({ message: 'El tag del ganador es obligatorio.' })
  winner_tag: string;

  @IsOptional()
  @IsBoolean()
  is_walkover?: boolean = false;
}
