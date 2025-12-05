import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CanjearCuponSelloDto {
  @ApiProperty({ description: 'Código del cupón', example: 'SELLO-ABC12345' })
  @IsString()
  codigo_cupon: string;
}
