import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar solo el Sender ID de una tienda
 */
export class UpdateSenderIdDto {
  @ApiProperty({
    description:
      'Sender ID alfanumérico (máximo 11 caracteres, solo A-Z y 0-9). Ejemplo: GYMFITZONE',
    example: 'GYMFITZONE',
    required: false,
    maxLength: 11,
  })
  @IsString()
  @IsOptional()
  @MaxLength(11, {
    message: 'El Sender ID no puede tener más de 11 caracteres',
  })
  @Matches(/^[A-Z0-9]+$/, {
    message:
      'El Sender ID solo puede contener letras mayúsculas (A-Z) y números (0-9), sin espacios ni caracteres especiales',
  })
  sender_id?: string;
}
