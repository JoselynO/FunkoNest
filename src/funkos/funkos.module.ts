import { Module } from '@nestjs/common';
import { FunkosService } from './funkos.service';
import { FunkosController } from './funkos.controller';
import { FunkosMapper } from './mappers/funkos.mapper'
import { TypeOrmModule } from "@nestjs/typeorm";
import { Categoria } from "../categorias/entities/categoria.entity";
import { Funko } from "./entities/funko.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria]),
    TypeOrmModule.forFeature([Funko]),
  ],
  controllers: [FunkosController],
  providers: [FunkosService, FunkosMapper],
})
export class FunkosModule {}
