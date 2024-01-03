import { Injectable } from '@nestjs/common';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { Categoria } from '../entities/categoria.entity';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CategoriaMapper {
  toEntity(categoriaDto: CreateCategoriaDto | UpdateCategoriaDto): Categoria {
    return plainToClass(Categoria, categoriaDto);
  }
}
