import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { CartaController } from './carta.controller';
import { CartaService } from './carta.service';

@Module({
  imports: [SupabaseModule],
  controllers: [CartaController],
  providers: [CartaService],
})
export class CartaModule {}
