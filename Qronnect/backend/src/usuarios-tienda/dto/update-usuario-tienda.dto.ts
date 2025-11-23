import { IsString, IsEmail, IsEnum, IsBoolean, IsOptional, MinLength, MaxLength, Matches, ValidateIf } from 'class-validator';

export class UpdateUsuarioTiendaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @ValidateIf(o => o.telefono && o.telefono.trim().length > 0)
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Formato de teléfono inválido' })
  telefono?: string;

  @ValidateIf(o => o.pin && o.pin.trim().length > 0)
  @IsString()
  @MinLength(4)
  @MaxLength(6)
  @Matches(/^\d{4,6}$/, { message: 'El PIN debe ser de 4-6 dígitos numéricos' })
  pin?: string;

  @IsOptional()
  @IsEnum(['owner', 'comercial'])
  rol?: 'owner' | 'comercial';

  @IsOptional()
  @IsBoolean()
  sms_2fa_activo?: boolean;

  // Solo validar el teléfono 2FA si tiene contenido
  @ValidateIf(o => o.sms_2fa_telefono && o.sms_2fa_telefono.trim().length > 0)
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Formato de teléfono 2FA inválido' })
  sms_2fa_telefono?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
