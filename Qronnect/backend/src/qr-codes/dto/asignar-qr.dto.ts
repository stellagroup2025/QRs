import { IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AsignarQrDto {
  @ApiProperty({
    description: 'Hash del QR code a asignar',
    example: 'abc123XYZ9',
  })
  @IsString()
  @Length(8, 12)
  hash: string;

  @ApiProperty({
    description: 'ID de la tienda a la que asignar el QR',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id_tienda: string;
}
