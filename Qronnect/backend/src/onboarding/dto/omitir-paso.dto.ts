import { IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OmitirPasoDto {
  @ApiProperty({
    description: 'Número del paso a omitir (1-5)',
    minimum: 1,
    maximum: 5,
    example: 2,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  paso: number;
}
