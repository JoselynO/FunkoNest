import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectModel } from "@nestjs/mongoose";
import { Pedido, PedidoDocument } from "./schemas/pedido.schema";
import { PaginateModel } from 'mongoose'
import { InjectRepository } from "@nestjs/typeorm";
import { Funko } from "../funkos/entities/funko.entity";
import { Repository } from "typeorm";
import { PedidosMapper } from "./mappers/pedidos.mapper";
export const PedidosOrderByValues: string[] = ['_id', 'idUsuario'];
export const PedidosOrderValues: string[] = ['asc', 'desc'];
@Injectable()
export class PedidosService {
  private logger = new Logger(PedidosService.name);

  constructor(
    @InjectModel(Pedido.name)
    private pedidosRepository: PaginateModel<PedidoDocument>,
    @InjectRepository(Funko)
    private readonly funkosRepository: Repository<Funko>,
    private readonly pedidosMapper: PedidosMapper,
  ) {
  }
  create(createPedidoDto: CreatePedidoDto) {
    return 'This action adds a new pedido';
  }

  async findAll(page: number, limit: number, orderBy: string, order: string) {
    this.logger.log(`Buscando todos los pedidos con paginación y filtros: ${JSON.stringify({page, limit, orderBy, order,})}`,)
    const options = { page, limit, sort:{[orderBy]: order,}, collection: 'es_ES',}
    return await this.pedidosRepository.paginate({}, options);
  }

  async findOne(id: string) {
   this.logger.log(`Buscando pedido con id ${id}`)
    const pedidoEncontrado = await this.pedidosRepository.findById(id).exec()
    if(!pedidoEncontrado){
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    return pedidoEncontrado;
  }

  as

  update(id: number, updatePedidoDto: UpdatePedidoDto) {
    return `This action updates a #${id} pedido`;
  }

  remove(id: number) {
    return `This action removes a #${id} pedido`;
  }
}
