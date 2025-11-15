import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { TiendasModule } from '../tiendas/tiendas.module';

@Module({
  imports: [TiendasModule],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService], // Exportar para usarlo en otros módulos
})
export class ClientesModule {}
