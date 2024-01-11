import { Module } from '@nestjs/common';
import { FunkosService } from './funkos.service';
import { FunkosController } from './funkos.controller';
import { FunkosMapper } from './mappers/funkos.mapper'
import { TypeOrmModule } from "@nestjs/typeorm";
import { Categoria } from "../categorias/entities/categoria.entity";
import { Funko } from "./entities/funko.entity";
import { StorageModule } from "../storage/storage.module";
import { NotificationsModule } from "../websockets/notifications/notifications.module";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria]),
    TypeOrmModule.forFeature([Funko]),
    StorageModule,
    NotificationsModule,
    CacheModule.register(),
  ],
  controllers: [FunkosController],
  providers: [FunkosService, FunkosMapper],
})
export class FunkosModule {}
