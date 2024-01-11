import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { CategoriaMapper } from './mappers/categoria-mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { NotificationsModule } from "../websockets/notifications/notifications.module";
import { Funko } from "../funkos/entities/funko.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Categoria]), TypeOrmModule.forFeature([Funko]), NotificationsModule],
  providers: [CategoriasService, CategoriaMapper],
  controllers: [CategoriasController],
  exports: [],
})
export class CategoriasModule {}
