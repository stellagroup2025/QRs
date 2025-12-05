import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject, MinLength, Matches, IsEmail } from 'class-validator';

export class CreateTiendaDto {
  @ApiProperty({
    description: 'Nombre del comercio',
    example: 'Cafetería Aroma',
  })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  nombre: string;

  @ApiProperty({
    description: 'Dominio único para la tienda (sin .qronnect.com)',
    example: 'cafeteria-aroma',
  })
  @IsString()
  @MinLength(3)
  dominio: string;

  @ApiPropertyOptional({
    description: 'Dominio personalizado del cliente (opcional)',
    example: 'www.cafeteriaaroma.com',
  })
  @IsOptional()
  @IsString()
  dominio_personalizado?: string;

  @ApiPropertyOptional({
    description: 'Dirección física del comercio',
    example: 'Calle Mayor 123, Madrid',
  })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del comercio',
    example: '+34912345678',
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Email del comercio',
    example: 'info@cafeteriaaroma.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'URL del logo del comercio',
    example: 'https://ejemplo.com/logo.png',
  })
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiPropertyOptional({
    description: 'Color primario de la marca en formato hex',
    example: '#FF5733',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color primario debe estar en formato hex válido (#RRGGBB)',
  })
  color_primario?: string;

  @ApiPropertyOptional({
    description: 'Color secundario de la marca en formato hex',
    example: '#333333',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color secundario debe estar en formato hex válido (#RRGGBB)',
  })
  color_secundario?: string;

  @ApiPropertyOptional({
    description: 'Color de acento de la marca en formato hex',
    example: '#0066CC',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color de acento debe estar en formato hex válido (#RRGGBB)',
  })
  color_acento?: string;

  @ApiPropertyOptional({
    description: 'Nombre comercial visible del negocio',
    example: 'Cafetería Aroma Premium',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre_comercial?: string;

  @ApiProperty({
    description: 'Plan contratado',
    enum: ['basico', 'profesional', 'enterprise'],
    example: 'profesional',
  })
  @IsEnum(['basico', 'profesional', 'enterprise'])
  plan: string;

  @ApiPropertyOptional({
    description: 'Configuración personalizada de la tienda',
    example: { puntos_por_euro: 1, moneda: 'EUR' },
  })
  @IsOptional()
  @IsObject()
  configuracion?: Record<string, any>;

  // ====================================
  // Datos del administrador/responsable
  // ====================================

  @ApiProperty({
    description: 'Nombre completo del administrador/responsable',
    example: 'Juan García López',
  })
  @IsString()
  @MinLength(3, { message: 'El nombre del administrador debe tener al menos 3 caracteres' })
  admin_nombre: string;

  @ApiProperty({
    description: 'Email del administrador (para credenciales de acceso)',
    example: 'juan@cafeteriaaroma.com',
  })
  @IsEmail({}, { message: 'El email del administrador no es válido' })
  admin_email: string;

  @ApiProperty({
    description: 'Rol del administrador en la tienda',
    enum: ['propietario', 'gerente', 'administrador', 'encargado'],
    example: 'propietario',
  })
  @IsEnum(['propietario', 'gerente', 'administrador', 'encargado'], {
    message: 'El rol debe ser: propietario, gerente, administrador o encargado',
  })
  admin_rol: string;
}
