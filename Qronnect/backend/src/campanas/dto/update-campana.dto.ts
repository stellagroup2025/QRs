import { PartialType } from '@nestjs/swagger';
import { CreateCampanaDto } from './create-campana.dto';

/**
 * DTO para actualizar una campaña existente
 * Todos los campos son opcionales (hereda de CreateCampanaDto con PartialType)
 */
export class UpdateCampanaDto extends PartialType(CreateCampanaDto) {}
