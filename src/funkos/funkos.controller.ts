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
import { Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { Request } from 'express'
import { Roles, RolesAuthGuard } from "../auth/guards/roles-auth.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { FunkoExistsGuard } from "./guards/funko-exists.guard";
import {
  ApiBadRequestResponse,
  ApiBearerAuth, ApiBody, ApiConsumes,
  ApiNotFoundResponse,
  ApiParam, ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags
} from "@nestjs/swagger";
import { ResponseFunkoDto } from './dto/response-funko.dto';

@Controller('funkos')
@UseInterceptors(CacheInterceptor)
@ApiTags('Funkos')
export class FunkosController {
  private readonly logger: Logger = new Logger(FunkosController.name)
  constructor(
    private readonly funkosService: FunkosService
  ) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: "Funko creado",
    type: ResponseFunkoDto,
  })
  @ApiBody({
    description: "Datos del funko que queremos crear",
    type: CreateFunkoDto
  })
  @ApiBadRequestResponse({
    description: "Algun campo del body es invalido"
  })
  @ApiBadRequestResponse({
    description: "La categoria no existe o no es válida"
  })
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log('Creando Funko')
    return await this.funkosService.create(createFunkoDto);
  }

  @Get()
  @CacheKey('all_funks')
  @CacheTTL(3)
  @ApiResponse({
    status: 200,
    description:
      'Lista de funkos paginada. Se puede filtrar por limite, pagina sortBy, filter y search',
    type: Paginated< ResponseFunkoDto>,
  })
  @ApiQuery({
    description: 'Filtro por limite por pagina',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro por pagina',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro de ordenación: campo:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: filter.campo = $eq:valor',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: search = valor',
    name: 'search',
    required: false,
    type: String,
  })
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log(`Buscando todos los Funkos`)
    return await this.funkosService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Funko encontrado',
    type: ResponseFunkoDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del funko no es válido',
  })
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    this.logger.log(`Encontrando un Funko con id:${id}`);
    return await this.funkosService.findOne(id);
    }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Funko creado',
    type: ResponseFunkoDto,
  })
  @ApiBody({
    description: 'Datos del funko a crear',
    type: CreateFunkoDto,
  })
  @ApiBadRequestResponse({
    description:
      'El algunos de los campos no es válido según la especificación del DTO',
  })
  @ApiBadRequestResponse({
    description: 'La categoría no existe o no es válida',
  })
  async update(@Param('id', new ParseIntPipe()) id: number, @Body(new BodyValidatorPipe()) updateFunkoDto: UpdateFunkoDto) {
    this.logger.log(`Updating funk by id: ${id}`);
    return await this.funkosService.update(id, updateFunkoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 204,
    description: 'Funko eliminado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del funko no es válido',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Deleting funk by id: ${id}`)
    return await this.funkosService.remove(id);
  }

  @Patch('/imagen/:id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @UseGuards(FunkoExistsGuard)
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 200,
    description: 'Imagen actualizada',
    type: ResponseFunkoDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiProperty({
    name: 'file',
    description: 'Fichero de imagen',
    type: 'string',
    format: 'binary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fichero de imagen',
    type: FileInterceptor('file'),
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del funko no es válido',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no es válido o de un tipo no soportado',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no puede ser mayor a 1 megabyte',
  })
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