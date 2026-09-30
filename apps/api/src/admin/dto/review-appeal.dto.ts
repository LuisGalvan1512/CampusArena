import { IsNotEmpty, IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewAppealDto {
  @IsNotEmpty({ message: 'La acción es obligatoria.' })
  @IsIn(['APPROVE', 'REJECT'], { message: 'La acción debe ser APPROVE o REJECT.' })
  action: 'APPROVE' | 'REJECT';

  @IsOptional()
  @IsString()
  admin_response?: string;
}
