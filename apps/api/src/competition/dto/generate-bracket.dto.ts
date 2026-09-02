import { IsEnum, IsOptional } from 'class-validator';

export enum SeedingMethod {
  RANDOM = 'RANDOM',
  BY_TROPHIES = 'BY_TROPHIES',
}

export class GenerateBracketDto {
  @IsOptional()
  @IsEnum(SeedingMethod)
  seeding_method?: SeedingMethod = SeedingMethod.RANDOM;
}
