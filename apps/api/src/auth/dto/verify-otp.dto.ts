import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'El formato de correo no es válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido.' })
  email: string;

  @IsString({ message: 'El código de verificación debe ser un texto.' })
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos.' })
  @IsNotEmpty({ message: 'El código es requerido.' })
  code: string;
}

export class ResendOtpDto {
  @IsEmail({}, { message: 'El formato de correo no es válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido.' })
  email: string;
}
