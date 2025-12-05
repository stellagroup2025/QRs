import { PartialType } from '@nestjs/swagger';
import { CreateProgramaSellosDto } from './create-programa-sellos.dto';

export class UpdateProgramaSellosDto extends PartialType(CreateProgramaSellosDto) {}
