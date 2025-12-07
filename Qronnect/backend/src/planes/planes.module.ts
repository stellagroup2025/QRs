import { Module } from '@nestjs/common';
import { PlanesController } from './planes.controller';
import { PlanesService } from './planes.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [PlanesController],
    providers: [PlanesService],
    exports: [PlanesService],
})
export class PlanesModule { }
