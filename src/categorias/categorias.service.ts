import { Injectable, Logger } from "@nestjs/common";
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Repository } from "typeorm";
import { Categoria } from "./entities/categoria.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoriaMapper } from "./mappers/categoria-mapper.service";

@Injectable()
export class CategoriasService {

  private readonly logger = new Logger(CategoriasService.name);

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly categoriaMapper: CategoriaMapper,
  ) {}
  async create(createCategoriaDto: CreateCategoriaDto) : Promise<Categoria> {
    this.logger.log('Create categoria ${createCategoriaDto}');
    const categoriaToCreate = this.categoriaMapper.toEntity(createCategoriaDto);
    return await this.categoriaRepository.save(categoriaToCreate);
  }

  async findAll(): Promise<Categoria[]> {
  this.logger.log('Encontrar todas las categorias');
  return await this.categoriaRepository.find();
  }

  async findOne(id: string) : Promise<Categoria> {
    this.logger.log('Encontrar todas las categorias por id ${id}');
    const categoriaEncontrada = await this.categoriaRepository.findOneBy({id})
    if (!categoriaEncontrada) {
      this.logger.log(`Categoria con id ${id} no encontrada`);
      throw new Error(`Categoria con id ${id} no encontrada`)
    }
    return categoriaEncontrada;
  }

  async update( id: string, updateCategoriaDto: UpdateCategoriaDto): Promise<Categoria> {
    this.logger.log('Actualizar categoria con ${id} ${updateCategoriaDto}');
    const categoriaActualizada = await this.findOne(id)
    return await this.categoriaRepository.save({
      ...categoriaActualizada,
      ...updateCategoriaDto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} categoria`;
  }
}
