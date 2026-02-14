import { IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfigurarPuntosDto {
    @ApiProperty({
        description: 'Cantidad de puntos otorgados por cada euro gastado',
        example: 10,
        minimum: 1,
        maximum: 100,
    })
    @IsNumber()
    @Min(1)
    @Max(100)
    puntos_por_euro: number;

    @ApiProperty({
        description: 'Cantidad de puntos otorgados como regalo de bienvenida',
        example: 100,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    puntos_bienvenida: number;
}
