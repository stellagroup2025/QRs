import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

const recortar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
/** Un texto vacío borra el campo */
const vacioANull = ({ value }: { value: unknown }) => {
  const v = recortar({ value });
  return v === '' ? null : v;
};

/** Los 14 alérgenos de declaración obligatoria (Reglamento UE 1169/2011) */
export const ALERGENOS = [
  'gluten',
  'crustaceos',
  'huevos',
  'pescado',
  'cacahuetes',
  'soja',
  'lacteos',
  'frutos_cascara',
  'apio',
  'mostaza',
  'sesamo',
  'sulfitos',
  'altramuces',
  'moluscos',
] as const;

export const ETIQUETAS = ['vegetariano', 'vegano', 'picante', 'sin_gluten', 'nuevo', 'casero'] as const;

export const PAGINAS_INICIO = ['landing', 'tres_vias'] as const;

export class CrearCategoriaDto {
  @ApiProperty({ example: 'Entrantes' })
  @Transform(recortar)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  nombre: string;

  @ApiProperty({ required: false, example: 'Para compartir' })
  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  descripcion?: string | null;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class ActualizarCategoriaDto {
  @ApiProperty({ required: false })
  @Transform(recortar)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  nombre?: string;

  @ApiProperty({ required: false })
  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  descripcion?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

class CamposPlatoDto {
  @ApiProperty({ required: false, example: 'Ocho unidades, cremosas por dentro' })
  @Transform(vacioANull)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string | null;

  @ApiProperty({ required: false, example: 9.5, description: 'En euros. Vacío = sin precio (p. ej. "según mercado")' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999)
  precio?: number | null;

  @ApiProperty({ required: false })
  @Transform(vacioANull)
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(1000)
  imagen_url?: string | null;

  @ApiProperty({ required: false, enum: ALERGENOS, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(ALERGENOS as unknown as string[], { each: true })
  alergenos?: string[];

  @ApiProperty({ required: false, enum: ETIQUETAS, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(ETIQUETAS as unknown as string[], { each: true })
  etiquetas?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  destacado?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  disponible?: boolean;
}

export class CrearPlatoDto extends CamposPlatoDto {
  @ApiProperty()
  @IsUUID()
  id_categoria: string;

  @ApiProperty({ example: 'Croquetas de jamón' })
  @Transform(recortar)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nombre: string;
}

export class ActualizarPlatoDto extends CamposPlatoDto {
  @ApiProperty({ required: false, description: 'Mover el plato a otra categoría' })
  @IsOptional()
  @IsUUID()
  id_categoria?: string;

  @ApiProperty({ required: false })
  @Transform(recortar)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nombre?: string;
}

export class OrdenarDto {
  @ApiProperty({ type: [String], description: 'IDs en el orden en que deben mostrarse' })
  @IsArray()
  @ArrayMaxSize(500)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  ids: string[];
}

export class ConfigPaginaDto {
  @ApiProperty({ required: false, enum: PAGINAS_INICIO })
  @IsOptional()
  @IsIn(PAGINAS_INICIO as unknown as string[])
  pagina_inicio?: (typeof PAGINAS_INICIO)[number];

  @ApiProperty({ required: false, example: 'https://g.page/r/XXXX/review' })
  @Transform(vacioANull)
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUrl({ protocols: ['https'], require_protocol: true }, { message: 'El enlace de Google debe empezar por https://' })
  @MaxLength(500)
  google_reviews_url?: string | null;
}
