import { IsEmail, IsString, IsUUID, Length, Matches, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsUUID('4', { message: 'ID de tienda inválido' })
  id_tienda: string;

  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @IsString({ message: 'El PIN es requerido' })
  @Length(4, 4, { message: 'El PIN debe tener exactamente 4 dígitos' })
  @Matches(/^\d{4}$/, { message: 'El PIN debe contener solo números' })
  pin: string;

  @IsString({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;
}
