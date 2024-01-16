import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { MongooseModule, SchemaFactory } from "@nestjs/mongoose";
import { Pedido } from "./schemas/pedido.schema";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Funko } from "../funkos/entities/funko.entity";
import * as mongoosePaginate from 'mongoose-paginate-v2'


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
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
