import { Module, forwardRef } from '@nestjs/common';
import { SuperAdminController } from './superadmin.controller';
import { SuperAdminService } from './superadmin.service';
import { SuperAdminGuard } from './guards/superadmin.guard';
import { SupabaseModule } from '../supabase/supabase.module';
import { SmsModule } from '../sms/sms.module';
import { EmailModule } from '../email/email.module';
import { InformesModule } from '../informes/informes.module';

@Module({
  imports: [SupabaseModule, SmsModule, EmailModule, forwardRef(() => InformesModule)],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, SuperAdminGuard],
  exports: [SuperAdminService, SuperAdminGuard],
})
export class SuperAdminModule {}
