import { Controller, Get, Post, Body, Param, Delete, HttpCode, Put, Logger, UseInterceptors } from "@nestjs/common";
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { UuidIdValidatorPipe } from "../pipes/validations/uuid-idvalidator.pipe";
import { BodyValidatorPipe } from "../pipes/validations/body-validator-pipe";
import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";

@Controller('categorias')
@UseInterceptors(CacheInterceptor)
export class CategoriasController {
  private readonly logger: Logger = new Logger(CategoriasController.name)
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @CacheKey('all_categories')
  @CacheTTL(30000)
  async findAll() {
    this.logger.log(`Buscando todas las cateorias de la BDD`)
    return  await this.categoriasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', new UuidIdValidatorPipe()) id: string) {
    this.logger.log(`Buscando categoria con id${id} de la BDD`)
    return await this.categoriasService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    this.logger.log(`Creando Categoria`)
    return await this.categoriasService.create(createCategoriaDto);
  }

  @Put(':id')
  async update(@Param('id', new UuidIdValidatorPipe()) id: string, @Body(new BodyValidatorPipe()) updateCategoriaDto: UpdateCategoriaDto) {
    this.logger.log(`Actualizando categoria con id ${id} de la BDD`)
    return await this.categoriasService.update(id, updateCategoriaDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', new UuidIdValidatorPipe()) id: string) {
    this.logger.log(`Eliminando categoria con id ${id} de la BDD`)
    await this.categoriasService.remove(id);
  }
}