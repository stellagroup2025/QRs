import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyEmailCodeDto {
  @ApiProperty({
    description: 'Email del superadmin',
    example: 'tu@email.com',
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @ApiProperty({
    description: 'Código de 6 dígitos recibido por email',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  codigo: string;
}
