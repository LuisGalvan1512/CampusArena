import {
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsUrl,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'La biografía no puede tener más de 300 caracteres.' })
  biography?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La carrera no puede tener más de 100 caracteres.' })
  career?: string;

  @IsOptional()
  @IsInt({ message: 'El ciclo debe ser un número entero.' })
  @Min(0, { message: 'El ciclo mínimo es 0 (para Docentes y Egresados).' })
  @Max(6, { message: 'Tecsup cuenta con hasta 6 ciclos académicos regulares.' })
  cycle?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'El apodo no puede tener más de 50 caracteres.' })
  nickname?: string;

  @IsOptional()
  @IsString({ message: 'El avatar debe ser una URL válida o identificador del sistema.' })
  avatar_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'La sede no puede tener más de 50 caracteres.' })
  campus?: string;
}
