import { IsUUID, IsEmail, IsArray, IsOptional, IsInt, Min, Max } from 'class-validator';

export class EnviarInformeDto {
  @IsUUID()
  @IsOptional()
  id_tienda?: string; // Opcional, puede venir del @Tenant()

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  periodo_mes?: number; // Si no se envía, usa mes anterior

  @IsInt()
  @Min(2024)
  @IsOptional()
  periodo_anio?: number;

  @IsEmail()
  email_destino: string; // Email principal

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  emails_cc?: string[]; // Emails en copia
}

export class EnviarInformePorIdDto {
  @IsUUID()
  id_informe: string;

  @IsEmail()
  email_destino: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  emails_cc?: string[];
}
