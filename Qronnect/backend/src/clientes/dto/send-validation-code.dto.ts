import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para solicitar el envío de código de validación de email
 */
export class SendValidationCodeDto {
  @ApiProperty({
    description: 'Email del cliente a validar',
    example: 'cliente@example.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;
}
