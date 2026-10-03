import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Equals, IsBoolean, IsEmail, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

const recortar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export const ESTADOS_SOLICITUD = ['nueva', 'contactada', 'convertida', 'descartada'] as const;

/** Formulario "Quiero Qronnect en mi negocio" de la web */
export class CrearSolicitudContactoDto {
  @ApiProperty({ example: 'Café Aurora' })
  @Transform(recortar)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nombre_negocio: string;

  @ApiProperty({ example: 'Elena Ruiz' })
  @Transform(recortar)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nombre_contacto: string;

  @ApiProperty({ example: 'elena@cafeaurora.es' })
  @Transform(recortar)
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(200)
  email: string;

  @ApiProperty({ example: '+34 600 000 000', required: false })
  @Transform(recortar)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  telefono?: string;

  @ApiProperty({ description: 'Sector (slug de /para/[sector] u "otro")', example: 'cafeterias', required: false })
  @Transform(recortar)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  sector?: string;

  @ApiProperty({ description: 'Plan que le interesa', example: 'Starter', required: false })
  @Transform(recortar)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  plan_interes?: string;

  @ApiProperty({ required: false })
  @Transform(recortar)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  mensaje?: string;

  @ApiProperty({ description: 'Página desde la que se envía', example: '/para/cafeterias', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origen?: string;

  @ApiProperty({ description: 'Acepta la política de privacidad' })
  @IsBoolean()
  @Equals(true, { message: 'Hay que aceptar la política de privacidad' })
  acepta_privacidad: boolean;

  /** Campo trampa para bots: las personas no lo ven y lo dejan vacío */
  @ApiProperty({ required: false, description: 'Dejar vacío' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  web?: string;
}

export class ActualizarSolicitudDto {
  @ApiProperty({ enum: ESTADOS_SOLICITUD })
  @IsIn(ESTADOS_SOLICITUD as unknown as string[])
  estado: (typeof ESTADOS_SOLICITUD)[number];
}

export class AsignarSolicitudDto {
  @ApiProperty({ description: 'Comercial que se encargará de la solicitud' })
  @IsUUID()
  comercial_id: string;
}
