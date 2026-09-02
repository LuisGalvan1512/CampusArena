import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class SubmitEvidenceDto {
  @IsString({ message: 'La URL o evidencia del comprobante es obligatoria.' })
  @IsNotEmpty({ message: 'La evidencia no puede estar vacía.' })
  evidence_url: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El número de operación no puede tener más de 100 caracteres.' })
  operation_reference?: string;
}
