import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { ContactoController } from './contacto.controller';
import { ContactoService } from './contacto.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ContactoController],
  providers: [ContactoService],
})
export class ContactoModule {}
