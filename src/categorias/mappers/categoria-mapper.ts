import { Injectable } from '@nestjs/common';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { Categoria } from '../entities/categoria.entity';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto';
import { ResponseCategoriaDto } from '../dto/response-categoria.dto';

@Injectable()
export class CategoriaMapper {
  toCreate(createCategoriaDto: CreateCategoriaDto,){
    const categoria = new Categoria();
    categoria.nombre = createCategoriaDto.nombre.toUpperCase();
    categoria.createdAt = new Date();
    categoria.updatedAt = new Date();
    categoria.isDeleted = false;
    return categoria;
  }

  toUpdate(updateCategoriaDto: UpdateCategoriaDto, categoriaActual : Categoria) {
    categoriaActual.nombre = updateCategoriaDto.nombre != null? updateCategoriaDto.nombre.toUpperCase() : categoriaActual.nombre;
    categoriaActual.isDeleted = updateCategoriaDto.isDeleted!= null? updateCategoriaDto.isDeleted : categoriaActual.isDeleted;
    categoriaActual.updatedAt = new Date();
    return categoriaActual;
  }

  toResponse(categoria: Categoria) {
    const response = new ResponseCategoriaDto();
    response.id = categoria.id;
    response.nombre = categoria.nombre;
    response.isDeleted = categoria.isDeleted;
    return response;
  }
}
