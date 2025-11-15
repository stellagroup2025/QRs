import { Module } from '@nestjs/common';
import { UsuariosTiendaController } from './usuarios-tienda.controller';
import { UsuariosTiendaService } from './usuarios-tienda.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [UsuariosTiendaController],
  providers: [UsuariosTiendaService],
  exports: [UsuariosTiendaService],
})
export class UsuariosTiendaModule {}
