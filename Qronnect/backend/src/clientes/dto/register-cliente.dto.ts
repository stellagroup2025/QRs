import { IsEmail, IsString, MinLength, IsOptional, Matches, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterClienteDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo del cliente' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @ApiProperty({ example: 'juan@email.com', description: 'Email del cliente' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @ApiProperty({ example: '612345678', description: 'Teléfono del cliente' })
  @IsString({ message: 'El teléfono debe ser un texto' })
  @MinLength(9, { message: 'El teléfono debe tener al menos 9 dígitos' })
  telefono: string;

  @ApiProperty({ example: '28001', description: 'Código postal del cliente', required: false })
  @IsOptional()
  @IsString({ message: 'El código postal debe ser un texto' })
  @Matches(/^\d{5}$/, { message: 'El código postal debe tener 5 dígitos' })
  codigo_postal?: string;

  @ApiProperty({ example: '1990-01-15', description: 'Fecha de nacimiento (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fecha_nacimiento?: string;
}
