import { Module } from '@nestjs/common';
import { ComercialesController } from './comerciales.controller';
import { ComercialesService } from './comerciales.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [SupabaseModule, EmailModule],
    controllers: [ComercialesController],
    providers: [ComercialesService],
    exports: [ComercialesService],
})
export class ComercialesModule { }

