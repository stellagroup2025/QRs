import { Module } from '@nestjs/common';
import { ComercialesController } from './comerciales.controller';
import { ComercialesService } from './comerciales.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { EmailModule } from '../email/email.module';
import { QrCodesModule } from '../qr-codes/qr-codes.module';
import { PlanesModule } from '../planes/planes.module';
import { PartnersModule } from '../partners/partners.module';

@Module({
    imports: [SupabaseModule, EmailModule, QrCodesModule, PlanesModule, PartnersModule],
    controllers: [ComercialesController],
    providers: [ComercialesService],
    exports: [ComercialesService],
})
export class ComercialesModule { }

