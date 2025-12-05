import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CanjearPremioGachaDto {
  @ApiProperty({ description: 'Código del premio ganado', example: 'A1B2C3D4' })
  @IsString()
  @MinLength(8)
  @MaxLength(8)
  codigo_canje: string;
}
