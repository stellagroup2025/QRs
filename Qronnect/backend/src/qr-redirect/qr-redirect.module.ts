import { Module } from '@nestjs/common';
import { QrRedirectController } from './qr-redirect.controller';
import { QrRedirectService } from './qr-redirect.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [QrRedirectController],
  providers: [QrRedirectService],
  exports: [QrRedirectService],
})
export class QrRedirectModule {}
