import { IsUUID, IsOptional, IsInt, Min, Max, IsEnum, IsBoolean } from 'class-validator';

export enum FormatoInforme {
  JSON = 'json',
  PDF = 'pdf',
  EMAIL = 'email',
}

export class GenerarInformeDto {
  @IsUUID()
  @IsOptional()
  id_tienda?: string; // Opcional porque puede venir del @Tenant() decorator

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  periodo_mes?: number; // Si no se especifica, usa mes anterior

  @IsInt()
  @Min(2024)
  @IsOptional()
  periodo_anio?: number; // Si no se especifica, usa año actual o anterior si estamos en enero

  @IsEnum(FormatoInforme)
  @IsOptional()
  formato?: FormatoInforme = FormatoInforme.JSON;

  @IsBoolean()
  @IsOptional()
  incluir_comparativa?: boolean = true;

  @IsBoolean()
  @IsOptional()
  incluir_plan_accion?: boolean = true;
}
