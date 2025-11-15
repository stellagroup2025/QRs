import { Module } from '@nestjs/common';
import { SuperAdminController } from './superadmin.controller';
import { SuperAdminService } from './superadmin.service';
import { SuperAdminGuard } from './guards/superadmin.guard';
import { SupabaseModule } from '../supabase/supabase.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [SupabaseModule, SmsModule],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, SuperAdminGuard],
  exports: [SuperAdminService, SuperAdminGuard],
})
export class SuperAdminModule {}
