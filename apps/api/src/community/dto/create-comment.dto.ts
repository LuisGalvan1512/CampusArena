import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;

  @IsOptional()
  @IsString()
  media_url?: string;

  @IsOptional()
  @IsString()
  parent_id?: string;
}
