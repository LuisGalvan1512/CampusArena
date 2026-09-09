import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'El rol debe ser STUDENT, ORGANIZER o ADMIN.' })
  @IsNotEmpty({ message: 'El rol es obligatorio.' })
  role: UserRole;
}
