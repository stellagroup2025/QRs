import { PartialType } from '@nestjs/swagger';
import { CreateCampanaSmsDto } from './create-campana-sms.dto';

/**
 * DTO para actualizar una campaña SMS existente
 * Todos los campos son opcionales
 */
export class UpdateCampanaSmsDto extends PartialType(CreateCampanaSmsDto) {}
