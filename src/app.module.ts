import { Module } from '@nestjs/common';
import { FunkosModule } from './funkos/funkos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './websockets/notifications/notifications.module';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from './config/database/database.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CorsConfigModule } from './config/cors/cors.module';
import * as process from 'process'
@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'dev'
        ? { envFilePath: '.env.dev' || '.env' }
        : { envFilePath: '.env.prod' },
    ),
    CorsConfigModule,
    CacheModule.register(),
    DatabaseModule,
    FunkosModule,
    CategoriasModule,
    StorageModule,
    NotificationsModule,
    DatabaseModule,
    PedidosModule,
    AuthModule,
    UsersModule,
  ],
  providers: [],
})
export class AppModule {}
