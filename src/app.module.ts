import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FunkosModule } from './funkos/funkos.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoriasModule } from './categorias/categorias.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FunkosModule,
    TypeOrmModule.forRoot({
      type: 'postgres', // Tipo de base de datos
      host: 'localhost', // Dirección del servidor
      port: 5432, // Puerto del servidor
      username: 'admin', // Nombre de usuario
      password: 'adminPassword123', // Contraseña de usuario
      database: 'NEST_DB', // Nombre de la base de datos
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Entidades de la base de datos (buscar archivos con extensión .entity.ts o .entity.js)
      synchronize: true, // Sincronizar la base de datos
    }),
    CategoriasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
