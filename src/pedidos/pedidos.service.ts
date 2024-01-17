import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
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
  async create(createPedidoDto: CreatePedidoDto) {
    this.logger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`)
    console.log(`Guardando pedido: ${createPedidoDto}`)
    const pedidoToBeSaved = this.pedidosMapper.toEntity(createPedidoDto)
    await this.checkPedido(pedidoToBeSaved)
    const pedidoToSave = await this.reserveStockPedidos(pedidoToBeSaved)
    pedidoToSave.createdAt = new Date()
    pedidoToSave.updatedAt = new Date()
    return await this.pedidosRepository.create(pedidoToSave)
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

  async findByIdUsuario(idUsuario: number) {
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`)
    return await this.pedidosRepository.find({ idUsuario }).exec()
  }

  async update(id: string, updatePedidoDto: UpdatePedidoDto) {
    this.logger.log(`Actualizando pedido con id ${id} y ${JSON.stringify(updatePedidoDto)}`,)
    const pedidoActualizado = await this.pedidosRepository.findById(id).exec()
    if (!pedidoActualizado) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    const pedidoGuardado = this.pedidosMapper.toEntity(updatePedidoDto)
    await this.returnStockPedidos(pedidoGuardado)
    await this.checkPedido(pedidoGuardado)
    const pedidoToSave = await this.reserveStockPedidos(pedidoGuardado)
    pedidoToSave.updatedAt = new Date()
    return await this.pedidosRepository.findByIdAndUpdate(id, pedidoToSave, { new: true }).exec()
  }

  async remove(id: string) {
    this.logger.log(`Eliminando pedido con id ${id}`)
    const pedidoEliminado = await this.pedidosRepository.findById(id).exec()
    if (!pedidoEliminado) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`)
    }
    await this.returnStockPedidos(pedidoEliminado)
    await this.pedidosRepository.findByIdAndDelete(id).exec()
  }

  private async checkPedido(pedido: Pedido): Promise<void> {
    this.logger.log(`Comprobando pedido ${JSON.stringify(pedido)}`)
    if (!pedido.lineasPedido || pedido.lineasPedido.length === 0) {
      throw new BadRequestException(
        'No se han agregado lineas de pedido al pedido actual',
      )
    }
    for (const lineaPedido of pedido.lineasPedido) {
      const funko = await this.funkosRepository.findOneBy({
        id: lineaPedido.idFunko,
      })
      if (!funko) {
        throw new BadRequestException(
          'El funko con id ${lineaPedido.idFunko} no existe',
        )
      }
      if (funko.cantidad < lineaPedido.cantidad && lineaPedido.cantidad > 0) {
        throw new BadRequestException(
          `La cantidad solicitada no es válida o no hay suficiente stock del funko ${funko.id}`,
        )
      }
      if (funko.precio !== lineaPedido.precioFunko) {
        throw new BadRequestException(
          `El precio del funko ${funko.id} del pedido no coincide con el precio actual del funko`,
        )
      }
    }
  }

  private async reserveStockPedidos(pedido: Pedido): Promise<Pedido> {
    this.logger.log(`Reservando stock del pedido: ${pedido}`);
    if (!pedido.lineasPedido || pedido.lineasPedido.length === 0) {
      throw new BadRequestException(`No se han agregado lineas de pedido`);
    }
    for (const lineaPedido of pedido.lineasPedido) {
      const funko = await this.funkosRepository.findOneBy({ id: lineaPedido.idFunko, })
      funko.cantidad -= lineaPedido.cantidad
      await this.funkosRepository.save(funko)
      lineaPedido.total = lineaPedido.cantidad * lineaPedido.precioFunko
    }
    pedido.total = pedido.lineasPedido.reduce(
      (sum, lineaPedido) => sum + lineaPedido.cantidad * lineaPedido.precioFunko, 0,)
    pedido.totalItems = pedido.lineasPedido.reduce(
      (sum, lineaPedido) => sum + lineaPedido.cantidad, 0,)
    return pedido;
  }

  private async returnStockPedidos(pedido: Pedido): Promise<Pedido> {
    this.logger.log(`Retornando stock del pedido: ${pedido}`);
    if (pedido.lineasPedido) {
      for (const lineaPedido of pedido.lineasPedido) {
        const funko = await this.funkosRepository.findOneBy({ id: lineaPedido.idFunko, })
        funko.cantidad += lineaPedido.cantidad
        await this.funkosRepository.save(funko)
      }
    }
    return pedido;
  }
}


