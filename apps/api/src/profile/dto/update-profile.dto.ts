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
  @Min(1, { message: 'El ciclo mínimo es 1.' })
  @Max(10, { message: 'El ciclo máximo es 10.' })
  cycle?: number;

  @IsOptional()
  @IsUrl({}, { message: 'La URL del avatar no tiene un formato válido.' })
  avatar_url?: string;
}
