import { Module, forwardRef } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { TiendasModule } from '../tiendas/tiendas.module';
import { EmailModule } from '../email/email.module';
import { ReferidosModule } from '../referidos/referidos.module';

@Module({
  imports: [
    TiendasModule,
    EmailModule,
    forwardRef(() => ReferidosModule), // forwardRef para evitar dependencias circulares
  ],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService], // Exportar para usarlo en otros módulos
})
export class ClientesModule {}
