import { IsUUID, IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';

export enum PaymentMethodDto {
  YAPE = 'YAPE',
  PLIN = 'PLIN',
  TRANSFER = 'TRANSFER',
}

export class CreateRegistrationDto {
  @IsUUID('4', { message: 'El game_profile_id debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'La cuenta de juego es obligatoria.' })
  game_profile_id: string;

  @IsEnum(PaymentMethodDto, {
    message: 'El método de pago debe ser YAPE, PLIN o TRANSFER.',
  })
  @IsNotEmpty({ message: 'El método de pago es obligatorio.' })
  payment_method: PaymentMethodDto;

  @IsOptional()
  @IsString()
  rules_version?: string = 'v1.0';
}
