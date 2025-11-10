import { Module } from '@nestjs/common';
import { ComprasService } from './compras.service';

/**
 * Módulo de compras
 * Proporciona servicios para gestionar compras
 * Los endpoints están en el módulo Admin
 */
@Module({
  providers: [ComprasService],
  exports: [ComprasService],
})
export class ComprasModule {}
