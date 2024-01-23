import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { MongooseModule, SchemaFactory } from "@nestjs/mongoose";
import { Pedido } from "./schemas/pedido.schema";
import { Funko } from "../funkos/entities/funko.entity";
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { PedidosMapper } from "./mappers/pedidos.mapper";
import { TypeOrmModule } from '@nestjs/typeorm'
import { Usuario } from "../users/entities/user.entity";


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Pedido.name,
        useFactory: () => {
          const schema = SchemaFactory.createForClass(Pedido)
          schema.plugin(mongoosePaginate)
          return schema
        },
      },
    ]),
    TypeOrmModule.forFeature([Funko]),
    TypeOrmModule.forFeature([Usuario]),
  ],
  controllers: [PedidosController],
  providers: [PedidosService, PedidosMapper],
  exports: [PedidosService],
})
export class PedidosModule {}
