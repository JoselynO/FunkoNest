import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Repository } from "typeorm";
import { Categoria } from "./entities/categoria.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoriaMapper } from "./mappers/categoria-mapper";
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class CategoriasService {

  private readonly logger = new Logger(CategoriasService.name);

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly categoriaMapper: CategoriaMapper,
  ) {}
  async create(createCategoriaDto: CreateCategoriaDto) {
    this.logger.log(`Creando categoria ${JSON.stringify(createCategoriaDto)}`);
    const categoriaActual = await this.check(createCategoriaDto.nombre);
    if(categoriaActual){
      this.logger.log(`Categoria con nombre ${categoriaActual.nombre} ya existe en la BD`)
      throw new BadRequestException(`Categoria con nombre ${categoriaActual.nombre} ya existe en la BD`)
    }
    const newCategoria = this.categoriaMapper.toCreate(createCategoriaDto);
    const resultado = await this.categoriaRepository.save({ ...newCategoria, id: uuidv4(),
    })
    return this.categoriaMapper.toResponse(resultado);
  }

  async findAll() {
  this.logger.log(`Encontrando todas las categorias`);
  const categorias = await this.categoriaRepository.find();
  return categorias.map((categoria) => this.categoriaMapper.toResponse(categoria));
  }

  async findOne(id: string){
    this.logger.log(`Encontrando categoria con id ${id}`);
    const categoriaEncontrada = await this.categoriaRepository.findOneBy({id})
    if (!categoriaEncontrada) {
      this.logger.log(`Categoria con id ${id}a no encontrada`);
      throw new NotFoundException(`Categoria con id ${id} no encontrada`)
    }
    return categoriaEncontrada;
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto){
    this.logger.log(`Actualizando categoria con id: ${id} con categoria: ${JSON.stringify(updateCategoriaDto)}`);
    const categoriaActual = await this.findOne(id);
    if(updateCategoriaDto.nombre) {
      const categoria = await this.check(updateCategoriaDto.nombre)
      if(categoria && categoria.id != id){
        this.logger.log(`Categoria ${updateCategoriaDto.nombre} ya existe en la BD`)
        throw new BadRequestException(`Categoria ${updateCategoriaDto.nombre} ya existe en la BD`)
      }
    }
    const categoriaActualizada = this.categoriaMapper.toUpdate(updateCategoriaDto, categoriaActual);
    return this.categoriaMapper.toResponse(
      await this.categoriaRepository.save(categoriaActualizada)
    );
  }

  async remove(id: string) {
    this.logger.log(`Borrando categoria con id: ${id}`);
    const categoriaBorrado = await this.findOne(id);
    return await this.categoriaRepository.remove(categoriaBorrado);
  }

  async removeSoft(id: string) {
    this.logger.log(`Eliminando categoria logico con el id:${id}`);
    const categoriaEliminada = await this.findOne(id);
    return await this.categoriaRepository.save({...categoriaEliminada, updatedAt: new Date(), isDeleted: true,})
  }
async check(categoria: string){
    return await this.categoriaRepository
      .createQueryBuilder()
      .where('LOWER(nombre) = LOWER(:nombre)',{ nombre : categoria.toLowerCase()})
      .getOne()
  }
}
