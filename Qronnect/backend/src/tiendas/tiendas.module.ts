import { Module } from '@nestjs/common';
import { TiendasService } from './tiendas.service';

/**
 * Módulo de tiendas
 * Proporciona servicios para gestionar tiendas
 */
@Module({
  providers: [TiendasService],
  exports: [TiendasService],
})
export class TiendasModule {}
