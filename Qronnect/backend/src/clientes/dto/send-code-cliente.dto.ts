import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendCodeClienteDto {
  @ApiProperty({ example: 'juan@email.com', description: 'Email del cliente registrado' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;
}
