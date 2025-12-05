import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class LoginAdminDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @IsString({ message: 'El PIN es requerido' })
  @Length(6, 6, { message: 'El PIN debe tener exactamente 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'El PIN debe contener solo números' })
  pin: string;
}
