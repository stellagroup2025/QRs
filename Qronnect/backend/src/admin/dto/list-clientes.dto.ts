import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class ListClientesDto {
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @IsOptional()
  @IsNumberString()
  limit?: string = '20';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  orderBy?: 'puntos_totales' | 'ultima_visita' | 'fecha_registro' = 'fecha_registro';

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';
}
