import { PartialType } from '@nestjs/swagger';
import { CreatePromocionDto } from './create-promocion.dto';

/**
 * DTO para actualizar una promoción existente
 * Todos los campos son opcionales
 */
export class UpdatePromocionDto extends PartialType(CreatePromocionDto) {}
