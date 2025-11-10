import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ComprasModule } from '../compras/compras.module';

@Module({
  imports: [ComprasModule], // Importar para usar ComprasService
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
