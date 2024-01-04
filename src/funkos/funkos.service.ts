import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { Funko } from "./entities/funko.entity";
import { FunkosMapper } from "./mappers/funkos.mapper";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Categoria } from "../categorias/entities/categoria.entity";

@Injectable()
export class FunkosService {
 private readonly logger: Logger = new Logger(FunkosService.name)

  constructor(
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly funkoMapper: FunkosMapper) {
  }

  async create(createFunkoDto: CreateFunkoDto) {
   this.logger.log(`Creando Funko ${JSON.stringify(createFunkoDto)}`)
    const categoria = await this.checkCategoria(createFunkoDto.categoria)
    const newFunko = this.funkoMapper.toCreate(createFunkoDto, categoria);
   const resultado = await this.funkoRepository.save(newFunko);
    return this.funkoMapper.toResponse(resultado);
  }

  async findAll() {
    this.logger.log('Encontrando todos los Funkos')
    const funkos = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .orderBy('funko.id', 'ASC')
      .getMany()
    return funkos.map((funko) =>
    this.funkoMapper.toResponse(funko),
      )
  }

  async findOne(id: number) {
   this.logger.log(`Encontrando un funko con el id:${id}`)
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', {id})
      .getOne()
    if (!funko) {
      throw new NotFoundException(`Funko con id ${id} no encontrado`)
    }
    return this.funkoMapper.toResponse(funko);
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Actualizando funko con id:${id} con funko: ${JSON.stringify(updateFunkoDto)}`);
    const funkoActual = await this.exists(id);
    let categoria: Categoria;
    if(updateFunkoDto.categoria){
      categoria = await this.checkCategoria(updateFunkoDto.categoria)
    } else {
      categoria = funkoActual.categoria;
    }
    const funkoActualizado = this.funkoMapper.toUpdate( updateFunkoDto,funkoActual, categoria);
    const resultado = await this.funkoRepository.save(funkoActualizado);
    return this.funkoMapper.toResponse(resultado);
  }

  public async checkCategoria(nombreCategoria: string){
    const categoriaEncontrada = await this.categoriaRepository
      .createQueryBuilder()
      .where('UPPER(nombre) = UPPER(:nombre)', {
        nombre: nombreCategoria,
      })
      .getOne();
    if(!categoriaEncontrada){
      this.logger.log(`Categoria ${nombreCategoria} no existe en la database`)
      throw new BadRequestException(`Categoria con nombre ${nombreCategoria} no existe en la BD`)
    }
    return categoriaEncontrada;
  }

  async remove(id: number) {
    this.logger.log(`Borrando Funko con id ${id}`)
    const funkoEliminado = await this.exists(id)
    return this.funkoMapper.toResponse(
      await this.funkoRepository.remove(funkoEliminado)
    );
  }

  async removeSoft(id:number){
    const funkoEliminado = await this.exists(id);
    funkoEliminado.isDeleted = true;
    return this.funkoMapper.toResponse(
      await this.funkoRepository.save(funkoEliminado)
    );
  }

  public async exists(id:number){
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', {id})
      .getOne()
    if (!funko){
      this.logger.log(`No se ha encontrado el funko con id: ${id}`)
      throw new NotFoundException(`Funko con id: ${id} no encontrado`)
    }
    return funko;
  }
}
