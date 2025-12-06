import { Module } from '@nestjs/common';
import { QrCodesController } from './qr-codes.controller';
import { QrCodesService } from './qr-codes.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [QrCodesController],
  providers: [QrCodesService],
  exports: [QrCodesService],
})
export class QrCodesModule {}
