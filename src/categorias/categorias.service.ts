import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Repository } from "typeorm";
import { Categoria } from "./entities/categoria.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CategoriaMapper } from "./mappers/categoria-mapper";
import { v4 as uuidv4 } from 'uuid'
import { Funko } from "../funkos/entities/funko.entity";
import { NotificationsGateway } from "../websockets/notifications/notifications.gateway";
import { Notificacion, NotificacionTipo } from "../websockets/notifications/entities/notification.entity";
import { ResponseCategoriaDto } from "./dto/response-categoria.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager'
import { FilterOperator, FilterSuffix, paginate, PaginateQuery } from "nestjs-paginate";
import { hash } from "typeorm/util/StringUtils";

@Injectable()
export class CategoriasService {

  private readonly logger = new Logger(CategoriasService.name);

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly categoriaMapper: CategoriaMapper,
    private readonly notificationsGateway: NotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
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
    const categoryResponse = this.categoriaMapper.toResponse(resultado);
    this.onChange(NotificacionTipo.CREATE, categoryResponse);
    await this.invalidateCacheKey('all_categories')
    return categoryResponse;
  }

  async findAll(query: PaginateQuery) {
  this.logger.log(`Encontrando todas las categorias`);
    const cache = await this.cacheManager.get(`all_categories_page${hash(JSON.stringify(query))}`);
    if(cache){
      this.logger.log('Categorias recuperadas de la cache')
      return cache;
    }
    const pagination = await paginate(query, this.categoriaRepository, {
      sortableColumns: ['nombre'],
      defaultSortBy:[['nombre', 'ASC']],
      searchableColumns: ['nombre'],
      filterableColumns: {
        nombre: [FilterOperator.EQ, FilterSuffix.NOT],
        isDeleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })
    const res = {
      data: (pagination.data ?? []).map((categoria) =>
        this.categoriaMapper.toResponse(categoria),
      ),
      meta: pagination.meta,
      links: pagination.links,
    }

    await this.cacheManager.set(
      `all_categories_page${hash(JSON.stringify(query))}`, res, 6000
    );
    return res;
  }

  async findOne(id: string){
    this.logger.log(`Encontrando categoria con id ${id}`);
    const cache: Categoria = await this.cacheManager.get(`category_${id}`);
    if(cache){
      this.logger.log('Categoria recuperada de la cache')
      return cache;
    }
    const categoriaEncontrada = await this.categoriaRepository.findOneBy({id})
    if (!categoriaEncontrada) {
      this.logger.log(`Categoria con id ${id}a no encontrada`);
      throw new NotFoundException(`Categoria con id ${id} no encontrada`);
    }
    await this.cacheManager.set(`category_${id}`, categoriaEncontrada, 60000);
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
    const categoriaUpdated  =  await this.categoriaRepository.save(categoriaActualizada)
    const categoriaResponse = this.categoriaMapper.toResponse(categoriaUpdated);
    this.onChange(NotificacionTipo.UPDATE, categoriaResponse);
    await this.invalidateCacheKey(`category_${id}`)
    await this.invalidateCacheKey(`category_name_${categoriaActual.nombre}`)
    await this.invalidateCacheKey('all_categories')
    return categoriaResponse;
  }

  async remove(id: string) {
    this.logger.log(`Borrando categoria con id: ${id}`);
    const categoriaBorrado = await this.findOne(id);
    await this.categoriaRepository
      .createQueryBuilder()
      .update(Funko)
      .set({categoria : null })
      .where('categoria = :id', {id})
      .execute();
    const categoriaDelete = await this.categoriaRepository.remove(categoriaBorrado);
    const categoriaResponse : ResponseCategoriaDto = {...this.categoriaMapper.toResponse(categoriaDelete), id: id, isDeleted: true};
    this.onChange(NotificacionTipo.DELETE, categoriaResponse);
    await this.invalidateCacheKey(`category_${id}`)
    await this.invalidateCacheKey(`category_name_${categoriaBorrado.nombre}`)
    await this.invalidateCacheKey('all_categories')
    return categoriaResponse;
  }

  async removeSoft(id: string) {
    this.logger.log(`Eliminando categoria logico con el id:${id}`);
    const categoriaEliminada : Categoria = await this.findOne(id);
    const categoriaDeleted : Categoria = await this.categoriaRepository.save({...categoriaEliminada, updatedAt: new Date(), isDeleted: true,})
    const categoryReponse = this.categoriaMapper.toResponse(categoriaDeleted);
    this.onChange(NotificacionTipo.DELETE, categoryReponse);
    await this.invalidateCacheKey(`category_${id}`)
    await this.invalidateCacheKey(`category_name_${categoriaEliminada.nombre}`)
    await this.invalidateCacheKey('all_categories')
    return categoryReponse;
  }
async check(nombreCategoria: string){
  const cache: Categoria = await this.cacheManager.get(`category_name_${nombreCategoria}`)
  if(cache){
    this.logger.log('Categoria encontrada en la cache')
    return cache;
  }
  const categoryEncontrada = await this.categoriaRepository
      .createQueryBuilder()
      .where('LOWER(nombre) = LOWER(:nombre)',{ nombre : nombreCategoria.toLowerCase()})
      .getOne();
  await this.cacheManager.set(`category_name_${nombreCategoria}`, categoryEncontrada, 60000);
  return categoryEncontrada;
  }

  private onChange(tipo: NotificacionTipo, data: ResponseCategoriaDto){
    const notificacion : Notificacion<ResponseCategoriaDto> = new Notificacion <ResponseCategoriaDto>(
      'CATEGORIAS',
      tipo,
      data,
      new Date(),
    )
    this.notificationsGateway.sendMessage(notificacion)
  }

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}

