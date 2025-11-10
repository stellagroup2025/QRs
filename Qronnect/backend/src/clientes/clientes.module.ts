import { Module } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService], // Exportar para usarlo en otros módulos
})
export class ClientesModule {}
