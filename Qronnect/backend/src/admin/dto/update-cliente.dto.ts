import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar los datos de un cliente
 * Todos los campos son opcionales
 */
export class UpdateClienteDto {
  @ApiPropertyOptional({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Email del cliente',
    example: 'juan.perez@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del cliente',
    example: '+34612345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, {
    message: 'El teléfono no tiene un formato válido',
  })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del cliente (ISO 8601)',
    example: '1990-01-15',
  })
  @IsOptional()
  @IsString()
  fecha_nacimiento?: string;

  @ApiPropertyOptional({
    description: 'Género del cliente',
    example: 'masculino',
    enum: ['masculino', 'femenino', 'otro', 'prefiero_no_decir'],
  })
  @IsOptional()
  @IsString()
  genero?: string;
}
