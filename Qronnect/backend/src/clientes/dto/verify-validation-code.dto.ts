import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para verificar el código de validación de email
 */
export class VerifyValidationCodeDto {
  @ApiProperty({
    description: 'Email del cliente',
    example: 'cliente@example.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @ApiProperty({
    description: 'Código de validación de 6 dígitos',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  codigo: string;
}
