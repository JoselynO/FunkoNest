import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpException,
  HttpStatus,
  BadRequestException, ValidationPipe, Put, Logger, ParseIntPipe
} from "@nestjs/common";
import { FunkosService } from './funkos.service'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { FunkosMapper } from './mappers/funkos.mapper'
import { Funko } from './entities/funko.entity'
import { BodyValidatorPipe } from "../pipes/validations/body-validator-pipe";

@Controller('funkos')
export class FunkosController {
  private readonly logger: Logger = new Logger(FunkosController.name)
  constructor(
    private readonly funkosService: FunkosService
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log('Creando Funko')
    return await this.funkosService.create(createFunkoDto);
  }

  @Get()
  @HttpCode(200)
  async findAll() {
    this.logger.log(`Buscando todos los Funkos`)
    return await this.funkosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    this.logger.log(`Encontrando un Funko con id:${id}`);
    return await this.funkosService.findOne(id);
    }

  @Put(':id')
  async update(@Param('id', new ParseIntPipe()) id: number, @Body(new BodyValidatorPipe()) updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Updating funk by id: ${id}`);
    return await this.funkosService.update(id, updateFunkoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', new  ParseIntPipe()) id: number) {
    this.logger.log(`Deleting funk by id: ${id}`)
    return await this.funkosService.remove(id);
  }
}
