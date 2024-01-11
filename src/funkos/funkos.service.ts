import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateFunkoDto } from "./dto/create-funko.dto";
import { UpdateFunkoDto } from "./dto/update-funko.dto";
import { Funko } from "./entities/funko.entity";
import { FunkosMapper } from "./mappers/funkos.mapper";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Categoria } from "../categorias/entities/categoria.entity";
import { StorageService } from "../storage/storage.service";
import { Request } from "express";
import { NotificationsGateway } from "../websockets/notifications/notifications.gateway";
import { ResponseFunkoDto } from "./dto/response-funko.dto";
import { Notificacion, NotificacionTipo } from "../websockets/notifications/entities/notification.entity";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import { Cache } from 'cache-manager'

@Injectable()
export class FunkosService {
 private readonly logger: Logger = new Logger(FunkosService.name)

  constructor(
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly funkoMapper: FunkosMapper,
    private readonly storageService: StorageService,
    private readonly notificationsGateway: NotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
  }

  async create(createFunkoDto: CreateFunkoDto) {
   this.logger.log(`Creando Funko ${JSON.stringify(createFunkoDto)}`)
    const categoria = await this.checkCategoria(createFunkoDto.categoria);
    const newFunko = this.funkoMapper.toCreate(createFunkoDto, categoria);
   const resultado = await this.funkoRepository.save(newFunko);
   const  responseFunko = this.funkoMapper.toResponse(resultado);
   this.onChange(NotificacionTipo.CREATE, responseFunko);
    await this.invalidateCacheKey('all_funks');
    return responseFunko;
  }

  async findAll() {
    this.logger.log('Encontrando todos los Funkos');
    const cache = await this.cacheManager.get(
      'all_funks'
    );

    if (cache){
      this.logger.log('Funkos recuperado de la cache');
      return cache;
    }
    const funkos = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .orderBy('funko.id', 'ASC')
      .getMany();
    const responseFunko: ResponseFunkoDto[] = funkos.map((funko) => this.funkoMapper.toResponse(funko));
    this.cacheManager.set('all_funks', responseFunko, 60000);
    return responseFunko;
  }

  async findOne(id: number) {
   this.logger.log(`Encontrando un funko con el id:${id}`)
    const cache: ResponseFunkoDto = await this.cacheManager.get(
      `funk_${id}`
    )
    if(cache){
      console.log('Funko recuperado de la cache');
      return cache
    }
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', {id})
      .getOne()
    if (!funko) {
      throw new NotFoundException(`Funko con id ${id} no encontrado`)
    }
    const responseFunko = this.funkoMapper.toResponse(funko);
    await this.cacheManager.set(`funko_${id}`, responseFunko, 60000);
    return responseFunko;
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
    const responseFunko = this.funkoMapper.toResponse(resultado);
    this.onChange(NotificacionTipo.UPDATE, responseFunko);
    await this.invalidateCacheKey(`funk_${id}`)
    await this.invalidateCacheKey(`funk_entity_${id}`);
    await this.invalidateCacheKey('all_funks')
    return responseFunko;
  }

  public async checkCategoria(nombreCategoria: string){
    const cache: Categoria = await this.cacheManager.get(
      `category_name_${nombreCategoria}`
    )
    if (cache){
      this.logger.log('Categoria recuperada de la cache');
      return cache;
    }
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
    await this.cacheManager.set(`category_name_${nombreCategoria}`, categoriaEncontrada, 60);
    return categoriaEncontrada;
  }

  async remove(id: number) {
    this.logger.log(`Borrando Funko con id ${id}`)
    const funkoToDelete = await this.exists(id)

    if(funkoToDelete.imagen && funkoToDelete.imagen !=  Funko.IMAGE_DEFAULT) {
      this.logger.log(`Borrando imagen ${funkoToDelete.imagen}`)
      this.storageService.removeFile(
        this.storageService.getFileNameWithouUrl(funkoToDelete.imagen),
      );
    }
   const funkoEliminado = await this.funkoRepository.remove(funkoToDelete);
    const responseFunko = this.funkoMapper.toResponse(funkoEliminado);
    this.onChange(NotificacionTipo.DELETE, responseFunko);
    await this.invalidateCacheKey(`funk_${id}`);
    await this.invalidateCacheKey(`funk_entity_${id}`);
    await this.invalidateCacheKey(`all_funks`);
    return responseFunko;
  }


  async removeSoft(id:number){
    const funkoEliminado = await this.exists(id);
    funkoEliminado.isDeleted = true;
   const funkoDeleted = await this.funkoRepository.save(funkoEliminado);
   const responseFunko = this.funkoMapper.toResponse(funkoDeleted);
   this.onChange(NotificacionTipo.DELETE, responseFunko);
    await this.invalidateCacheKey(`funk_${id}`);
    await this.invalidateCacheKey(`funk_entity_${id}`);
    await this.invalidateCacheKey(`all_funks`);
   return responseFunko;
  }

  public async exists(id:number){
    const cache: Funko = await this.cacheManager.get(
      `funk_entity_${id}`
    )
    if (cache){
      this.logger.log('Funko recuperado de la cache');
      return cache;
    }
    const funko = await this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')
      .where('funko.id = :id', {id})
      .getOne()
    if (!funko){
      this.logger.log(`No se ha encontrado el funko con id: ${id}`)
      throw new NotFoundException(`Funko con id: ${id} no encontrado`)
    }
    await this.cacheManager.set(`funk_entity_${id}`, funko, 60000);
    return funko;
  }

  public async updateImage(
    id: number,
    file: Express.Multer.File,
    req: Request,
    withUrl: boolean = true,
  ) {
    this.logger.log(`Update image funko by id:${id}`)
    const funkoToUpdate = await this.exists(id)
    if (funkoToUpdate.imagen !== Funko.IMAGE_DEFAULT) {
      this.logger.log(`Borrando imagen ${funkoToUpdate.imagen}`)
      let imagePath = funkoToUpdate.imagen
      if (withUrl) {
        imagePath = this.storageService.getFileNameWithouUrl(
          funkoToUpdate.imagen,
        )
      }
      try {
        this.storageService.removeFile(imagePath)
      } catch (error) {
        this.logger.error(error)
      }
    }

    if (!file) {
      throw new BadRequestException('Fichero no encontrado.')
    }

    let filePath: string

    if (withUrl) {
      this.logger.log(`Generando url para ${file.filename}`)

      const apiVersion = process.env.API_VERSION
        ? `/${process.env.API_VERSION}`
        : ''
      filePath = `${req.protocol}://${req.get('host')}${apiVersion}/storage/${
        file.filename
      }`
    } else {
      filePath = file.filename
    }

    funkoToUpdate.imagen = filePath
    const funkoUpdated = await this.funkoRepository.save(funkoToUpdate);
    const responseFunko = this.funkoMapper.toResponse(funkoUpdated);
    this.onChange(NotificacionTipo.UPDATE, responseFunko);
    await this.invalidateCacheKey(`funk_${id}`)
    await this.invalidateCacheKey(`funk_entity_${id}`);
    await this.invalidateCacheKey('all_funks')
    return responseFunko;
  }

  private onChange(tipo: NotificacionTipo, data: ResponseFunkoDto){
    const notificacion : Notificacion<ResponseFunkoDto> = new Notificacion <ResponseFunkoDto>(
      'FUNKOS',
      tipo,
      data,
      new Date(),
    )
    this.notificationsGateway.sendMessage(notificacion)
  }

  async invalidateCacheKey(keyPattern: string) {
    const cacheKeys = await this.cacheManager.store.keys();
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern));
    const promises = keysToDelete.map((key) => this.cacheManager.del(key));
    await Promise.all(promises);
  }
}

