import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [PartnersController],
    providers: [PartnersService],
    exports: [PartnersService],
})
export class PartnersModule { }
