import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsWebhookController } from './sms-webhook.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SmsWebhookController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
