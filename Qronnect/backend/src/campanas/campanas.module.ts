import { Module } from '@nestjs/common';
import { CampanasService } from './campanas.service';
import { CampanasController } from './campanas.controller';
import { CampanasSmsService } from './campanas-sms.service';
import { CampanasSmsController } from './campanas-sms.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { AiModule } from '../ai/ai.module';

/**
 * Módulo de campañas de marketing (Email y SMS)
 * Gestiona la creación, envío y seguimiento de campañas con segmentación avanzada
 */
@Module({
  imports: [SupabaseModule, AuthModule, EmailModule, SmsModule, AiModule],
  controllers: [CampanasController, CampanasSmsController],
  providers: [CampanasService, CampanasSmsService],
  exports: [CampanasService, CampanasSmsService],
})
export class CampanasModule {}
