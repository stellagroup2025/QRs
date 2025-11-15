import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
