import { Module } from '@nestjs/common';
import { BrandingController } from './branding.controller';
import { BrandingService } from './branding.service';
import { LandingService } from './landing.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [BrandingController],
  providers: [BrandingService, LandingService],
  exports: [BrandingService, LandingService],
})
export class BrandingModule {}
