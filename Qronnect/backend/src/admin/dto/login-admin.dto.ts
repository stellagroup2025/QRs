import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class LoginAdminDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @IsString({ message: 'El PIN es requerido' })
  @Length(4, 4, { message: 'El PIN debe tener exactamente 4 dígitos' })
  @Matches(/^\d{4}$/, { message: 'El PIN debe contener solo números' })
  pin: string;
}
