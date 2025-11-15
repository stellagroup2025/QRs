import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar los datos de un cliente
 */
export class UpdateClienteDto {
  @ApiPropertyOptional({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del cliente',
    example: '+34 600 123 456',
  })
  @IsOptional()
  @IsString()
  @MinLength(9)
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Email del cliente',
    example: 'juan@ejemplo.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Género del cliente',
    example: 'masculino',
    enum: ['masculino', 'femenino', 'otro', 'prefiero_no_decir'],
  })
  @IsOptional()
  @IsString()
  genero?: string;
}
