import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrarReferidoDto {
  @ApiProperty({
    description: 'Código de referido del cliente que refiere',
    example: 'JUAN-A3F2',
  })
  @IsString()
  @IsNotEmpty()
  codigo_referido: string;

  @ApiProperty({
    description: 'ID del nuevo cliente que fue referido',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  nuevo_cliente_id: string;
}
