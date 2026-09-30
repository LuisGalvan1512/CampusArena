import { IsNotEmpty, IsString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateAppealDto {
  @IsNotEmpty({ message: 'El ID de la sanción es obligatorio.' })
  @IsUUID('all', { message: 'El ID de la sanción no es válido.' })
  sanction_id: string;

  @IsNotEmpty({ message: 'El texto de la apelación no puede estar vacío.' })
  @IsString()
  @MinLength(10, { message: 'Tu apelación debe tener al menos 10 caracteres explicativos.' })
  @MaxLength(1000, { message: 'Tu apelación no puede superar los 1000 caracteres.' })
  appeal_text: string;
}
