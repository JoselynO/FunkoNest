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
  BadRequestException, ValidationPipe
} from "@nestjs/common";
import { FunkosService } from './funkos.service'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { FunkosMapper } from './mappers/funkos.mapper'
import { Funko } from './entities/funko.entity'

@Controller('funkos')
export class FunkosController {
  constructor(
    private readonly funkosService: FunkosService,
    private readonly funkosMapper: FunkosMapper,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    const funkoCreado: Funko = await this.funkosService.create(createFunkoDto)
    return this.funkosMapper.toResponse(funkoCreado)
  }

  @Get()
  @HttpCode(200)
  async findAll() {
    const funkos: Funko[] = await this.funkosService.findAll()
    return funkos.map((funko) => this.funkosMapper.toResponse(funko))
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const funko: Funko = await this.funkosService.findOne(id)
    return this.funkosMapper.toResponse(funko)
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body()
    updateFunkoDto: UpdateFunkoDto,
  ) {
    const funkoActualizado: Funko = await this.funkosService.update(+id, updateFunkoDto)
    return this.funkosMapper.toResponse(funkoActualizado)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: number) {
    return await this.funkosService.remove(+id)
  }
}
