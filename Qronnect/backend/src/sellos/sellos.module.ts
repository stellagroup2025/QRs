import { Module } from '@nestjs/common';
import { SellosController } from './sellos.controller';
import { SellosService } from './sellos.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SellosController],
  providers: [SellosService],
  exports: [SellosService],
})
export class SellosModule {}
