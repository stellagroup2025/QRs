import { PartialType } from '@nestjs/swagger';
import { CrearPremioGachaDto } from './crear-premio-gacha.dto';

export class ActualizarPremioGachaDto extends PartialType(CrearPremioGachaDto) {}
