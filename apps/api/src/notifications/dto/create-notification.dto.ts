import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  type: 'PAYMENT' | 'MATCH_CALL' | 'TOURNAMENT' | 'DIPLOMA' | 'STREAM' | 'SYSTEM';

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  link_label?: string;
}
