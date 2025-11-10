import { IsOptional, IsNumberString, IsString, IsDateString } from 'class-validator';

export class ListComprasDto {
  @IsOptional()
  @IsNumberString()
  page?: string = '1';

  @IsOptional()
  @IsNumberString()
  limit?: string = '20';

  @IsOptional()
  @IsString()
  clienteId?: string;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsString()
  orderBy?: 'fecha' | 'importe' | 'puntos_otorgados' = 'fecha';

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';
}
