import { Module } from '@nestjs/common';
import { ProspectosController } from './prospectos.controller';
import { ProspectosService } from './prospectos.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [ProspectosController],
    providers: [ProspectosService],
    exports: [ProspectosService]
})
export class ProspectosModule { }
