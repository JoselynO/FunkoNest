import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  BadRequestException, Put, Logger, ParseIntPipe, UseInterceptors, UploadedFile, Req, UseGuards
} from "@nestjs/common";
import { FunkosService } from './funkos.service'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { BodyValidatorPipe } from "../pipes/validations/body-validator-pipe";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, parse } from "path";
import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { Paginate, PaginateQuery } from "nestjs-paginate";
import { Request } from 'express'
import { Roles, RolesAuthGuard } from "../auth/guards/roles-auth.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FunkoExistsGuard } from "./guards/funko-exists.guard";

@Controller('funkos')
@UseInterceptors(CacheInterceptor)
export class FunkosController {
  private readonly logger: Logger = new Logger(FunkosController.name)
  constructor(
    private readonly funkosService: FunkosService
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log('Creando Funko')
    return await this.funkosService.create(createFunkoDto);
  }

  @Get()
  @HttpCode(200)
  @CacheKey('all_funks')
  @CacheTTL(30000)
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log(`Buscando todos los Funkos`)
    return await this.funkosService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    this.logger.log(`Encontrando un Funko con id:${id}`);
    return await this.funkosService.findOne(id);
    }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  async update(@Param('id', new ParseIntPipe()) id: number, @Body(new BodyValidatorPipe()) updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Updating funk by id: ${id}`);
    return await this.funkosService.update(id, updateFunkoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Deleting funk by id: ${id}`)
    return await this.funkosService.remove(id);
  }

  @Patch('/imagen/:id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @UseGuards(FunkoExistsGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const { name } = parse(file.originalname)
          const fileName = `${Date.now()}_${name.replace(/\s/g, '')}`
          const fileExt = extname(file.originalname)
          cb(null, `${fileName}${fileExt}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
        const maxFileSize = 1024 * 1024 // 1 megabyte
        if (!allowedMimes.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Fichero no soportado. No es del tipo imagen válido',
            ),
            false,
          );
        } else if (file.size > maxFileSize) {
          cb(
            new BadRequestException(
              'El tamaño del archivo no puede ser mayor a 1 megabyte.',
            ),
            false,
          );
        } else {
          cb(null, true)
        }
      },
    }),
  )
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    this.logger.log(`Actualizando imagen al producto con ${id}:  ${file}`)

    return await this.funkosService.updateImage(id, file, req, true)
  }
}