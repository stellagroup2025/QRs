import { IsUUID, IsEmail, IsBoolean, IsInt, Min, Max, IsOptional, IsArray, IsString } from 'class-validator';

export class ConfiguracionInformeDto {
  @IsUUID()
  @IsOptional()
  id_tienda?: string;

  @IsBoolean()
  @IsOptional()
  automatico?: boolean;

  @IsEmail()
  @IsOptional()
  email_destino?: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  emails_cc?: string[];

  @IsInt()
  @Min(1)
  @Max(28)
  @IsOptional()
  dia_envio?: number;

  @IsInt()
  @Min(0)
  @Max(23)
  @IsOptional()
  hora_envio?: number;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsBoolean()
  @IsOptional()
  incluir_pdf?: boolean;

  @IsBoolean()
  @IsOptional()
  incluir_analisis_ia?: boolean;

  @IsBoolean()
  @IsOptional()
  incluir_comparativa?: boolean;

  @IsBoolean()
  @IsOptional()
  incluir_plan_accion?: boolean;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
