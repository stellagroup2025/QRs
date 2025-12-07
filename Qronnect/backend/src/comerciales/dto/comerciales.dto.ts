import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginComercialDto {
    @ApiProperty({ example: 'juan@ventas.com', description: 'Email del comercial' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Contraseña del comercial' })
    @IsString()
    @MinLength(6)
    password: string;
}

export class CreateComercialDto {
    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo' })
    @IsString()
    nombre: string;

    @ApiProperty({ example: 'juan@ventas.com', description: 'Email del comercial' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: 'Contraseña inicial' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: '+34600123456', description: 'Teléfono', required: false })
    @IsString()
    telefono?: string;
}
