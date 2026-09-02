import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class ReactionDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['LIKE', 'HAHA', 'WOW', 'SAD', 'ANGRY'])
  type: string;
}
