import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Credenciales de Twilio para modo "propio"
 */
export class TwilioCredencialesDto {
  @ApiProperty({
    description: 'Account SID de Twilio',
    example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  account_sid: string;

  @ApiProperty({
    description: 'Auth Token de Twilio',
    example: 'tu_auth_token_secreto',
  })
  @IsString()
  @IsNotEmpty()
  auth_token: string;

  @ApiProperty({
    description: 'Número de teléfono de Twilio (formato E.164)',
    example: '+34666123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({
    description: 'Sender ID alfanumérico (alternativa al número). Máx 11 caracteres. Solo funciona en ciertos países (España, UK, etc). No permite respuestas.',
    example: 'GYMFITZONE',
    required: false,
  })
  @IsString()
  @IsOptional()
  sender_id?: string;
}

/**
 * Límites de envío de SMS
 */
export class SmsLimitesDto {
  @ApiProperty({
    description: 'Máximo de SMS por día',
    example: 500,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  max_por_dia?: number;

  @ApiProperty({
    description: 'Máximo de SMS por mes',
    example: 10000,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  max_por_mes?: number;
}

/**
 * DTO para configurar SMS en una tienda
 */
export class ConfigureSmsDto {
  @ApiProperty({
    description: 'Activar o desactivar SMS para la tienda',
    example: true,
  })
  @IsBoolean()
  activo: boolean;

  @ApiProperty({
    description: 'Modo de operación: global (usa cuenta Qronnect) o propio (usa cuenta del tenant)',
    enum: ['global', 'propio'],
    example: 'global',
  })
  @IsEnum(['global', 'propio'])
  modo: 'global' | 'propio';

  @ApiProperty({
    description: 'Credenciales de Twilio (requerido si modo = "propio")',
    type: TwilioCredencialesDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => TwilioCredencialesDto)
  @IsOptional()
  credenciales?: TwilioCredencialesDto;

  @ApiProperty({
    description: 'Límites de envío',
    type: SmsLimitesDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => SmsLimitesDto)
  @IsOptional()
  limites?: SmsLimitesDto;

  @ApiProperty({
    description: 'Créditos SMS prepagados disponibles (solo para modo global)',
    example: 100,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  creditos_disponibles?: number;

  @ApiProperty({
    description: 'Sender ID alfanumérico para modo global (opcional). Máx 11 caracteres. Ej: GYMFITZONE',
    example: 'QRONNECT',
    required: false,
  })
  @IsString()
  @IsOptional()
  sender_id?: string;
}
