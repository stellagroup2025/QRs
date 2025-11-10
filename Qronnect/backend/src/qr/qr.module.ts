import { Module } from '@nestjs/common';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';

@Module({
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService], // Exportar para usarlo en otros módulos si es necesario
})
export class QrModule {}
