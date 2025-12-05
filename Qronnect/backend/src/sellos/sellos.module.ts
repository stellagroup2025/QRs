import { Module } from '@nestjs/common';
import { SellosController } from './sellos.controller';
import { SellosService } from './sellos.service';

@Module({
  controllers: [SellosController],
  providers: [SellosService],
  exports: [SellosService],
})
export class SellosModule {}
