import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { InformesController } from './informes.controller';
import { InformesService } from './informes.service';
import { InformesScheduler } from './informes.scheduler';
import { SupabaseModule } from '../supabase/supabase.module';
import { AiModule } from '../ai/ai.module';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ScheduleModule.forRoot(), SupabaseModule, AiModule, EmailModule, AuthModule],
  controllers: [InformesController],
  providers: [InformesService, InformesScheduler],
  exports: [InformesService],
})
export class InformesModule {}
