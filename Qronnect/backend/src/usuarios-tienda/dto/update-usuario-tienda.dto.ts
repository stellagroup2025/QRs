import { IsString, IsEmail, IsEnum, IsBoolean, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateUsuarioTiendaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Formato de teléfono inválido' })
  telefono?: string;

  @IsOptional()
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

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Formato de teléfono 2FA inválido' })
  sms_2fa_telefono?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
