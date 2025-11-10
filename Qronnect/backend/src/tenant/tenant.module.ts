import { Module, Global } from '@nestjs/common';
import { TenantService } from './tenant.service';

/**
 * Módulo global de multitenancy
 * Gestiona la identificación y configuración de tenants (tiendas) por dominio
 */
@Global()
@Module({
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
