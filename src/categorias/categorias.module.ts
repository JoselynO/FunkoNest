import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { CategoriaMapper } from './mappers/categoria-mapper.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria])],
  providers: [CategoriasService, CategoriaMapper],
  controllers: [CategoriasController],
  exports: [],
})
export class CategoriasModule {}
