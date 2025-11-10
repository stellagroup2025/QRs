import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendEmailCodeDto {
  @ApiProperty({
    description: 'Email del superadmin',
    example: 'tu@email.com',
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;
}
