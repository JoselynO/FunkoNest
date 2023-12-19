import { Module } from '@nestjs/common';
import { FunkosService } from './funkos.service';
import { FunkosController } from './funkos.controller';
import { FunkosMapper } from './mappers/funkos.mapper'

@Module({
  controllers: [FunkosController],
  providers: [FunkosService, FunkosMapper],
})
export class FunkosModule {}
