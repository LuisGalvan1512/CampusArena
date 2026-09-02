import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsBoolean,
  Equals,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Match } from '../decorators/match.decorator.js';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(50, { message: 'El nombre no puede tener más de 50 caracteres.' })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres.' })
  @MaxLength(50, { message: 'El apellido no puede tener más de 50 caracteres.' })
  last_name: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @Matches(/(?=.*[a-z])/, { message: 'La contraseña debe contener al menos una letra minúscula.' })
  @Matches(/(?=.*[A-Z])/, { message: 'La contraseña debe contener al menos una letra mayúscula.' })
  @Matches(/(?=.*\d)/, { message: 'La contraseña debe contener al menos un número.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'La confirmación de contraseña es obligatoria.' })
  @Match('password', { message: 'Las contraseñas no coinciden.' })
  confirm_password: string;

  @IsBoolean({ message: 'Debes aceptar los términos y condiciones.' })
  @Equals(true, { message: 'Debes aceptar los términos y condiciones.' })
  terms_accepted: boolean;
}
