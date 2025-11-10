import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * DTO para validar un canje escaneando el código
 */
export class ValidarCanjeDto {
  @ApiProperty({
    description: 'Código del canje a validar',
    example: 'A3K7-M9P2-X5L8',
  })
  @IsString()
  @MinLength(8)
  codigo_canje: string;
}

/**
 * DTO de respuesta al validar un canje
 */
export class ValidarCanjeResponseDto {
  @ApiProperty({ description: 'ID del canje' })
  id: string;

  @ApiProperty({ description: 'Información del cliente' })
  cliente: {
    id: string;
    nombre: string;
    email: string;
  };

  @ApiProperty({ description: 'Información de la promoción' })
  promocion: {
    id: string;
    titulo: string;
    descripcion: string;
    tipo: string;
    valor: number;
  };

  @ApiProperty({ description: 'Puntos usados' })
  puntos_usados: number;

  @ApiProperty({ description: 'Estado previo del canje' })
  estado_anterior: string;

  @ApiProperty({ description: 'Estado actual del canje' })
  estado_actual: string;

  @ApiProperty({ description: 'Fecha original del canje' })
  fecha_canje: string;

  @ApiProperty({ description: 'Fecha de uso (ahora)' })
  fecha_uso: string;

  @ApiProperty({ description: 'Mensaje de confirmación' })
  mensaje: string;
}
