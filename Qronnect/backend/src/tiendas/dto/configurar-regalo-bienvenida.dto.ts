import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ValorRegaloDto {
  @ApiProperty({ description: 'Puntos a otorgar (solo para tipo puntos)', required: false })
  @IsOptional()
  puntos?: number;

  @ApiProperty({ description: 'Porcentaje de descuento del cupón (solo para tipo cupon)', required: false })
  @IsOptional()
  descuento_porcentaje?: number;

  @ApiProperty({ description: 'ID de la promoción a asociar (solo para tipo promocion)', required: false })
  @IsOptional()
  promocion_id?: string;

  @ApiProperty({ description: 'Mensaje personalizado para el cliente', required: false })
  @IsOptional()
  mensaje_personalizado?: string;

  @ApiProperty({ description: 'Si se debe enviar email de notificación', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  enviar_email?: boolean;

  @ApiProperty({ description: 'Si se debe enviar SMS de notificación', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  enviar_sms?: boolean;
}

export class ConfigurarRegaloBienvenidaDto {
  @ApiProperty({
    description: 'Si el sistema de regalos está activo',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  activo: boolean;

  @ApiProperty({
    description: 'Tipo de regalo a otorgar',
    enum: ['puntos', 'cupon', 'promocion'],
    example: 'puntos',
  })
  @IsEnum(['puntos', 'cupon', 'promocion'])
  @IsNotEmpty()
  tipo: 'puntos' | 'cupon' | 'promocion';

  @ApiProperty({
    description: 'Configuración del regalo según el tipo',
    type: ValorRegaloDto,
  })
  @ValidateNested()
  @Type(() => ValorRegaloDto)
  @IsObject()
  @IsNotEmpty()
  valor: ValorRegaloDto;
}
