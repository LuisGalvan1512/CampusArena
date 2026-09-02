import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  media_url?: string;
}
