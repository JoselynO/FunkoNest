import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FunkosModule } from './funkos/funkos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './websockets/notifications/notifications.module';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from "./config/database/database.module";
import { PedidosModule } from './pedidos/pedidos.module';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot(),
    FunkosModule,
    CategoriasModule,
    StorageModule,
    NotificationsModule,
    DatabaseModule,
    PedidosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
