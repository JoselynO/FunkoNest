import { Injectable } from '@nestjs/common';
import { CreateFunkoDto } from '../dto/create-funko.dto';
import { UpdateFunkoDto } from '../dto/update-funko.dto';
import { ResponseFunkoDto } from '../dto/response-funko.dto';
import { Funko } from '../entities/funko.entity'
@Injectable()
export class FunkosMapper {
  toCreate(createFunkoDto: CreateFunkoDto): Funko {
    let fk: Funko = new Funko();
    fk.nombre = createFunkoDto.nombre;
    fk.categoria = createFunkoDto.categoria;
    fk.precio = createFunkoDto.precio;
    fk.cantidad = createFunkoDto.cantidad;
    fk.imagen = createFunkoDto.imagen;
    fk.isDeleted = createFunkoDto.isDeleted || false;
    fk.createdAt = new Date();
    fk.updatedAt = new Date();
    return fk;
  }

  toUpdate(updateFunko: UpdateFunkoDto, funkoActualizado: Funko): Funko{
    let fk: Funko = new Funko();
    fk.id = funkoActualizado.id;
    fk.nombre = updateFunko.nombre || funkoActualizado.nombre;
    fk.categoria = updateFunko.categoria ||  funkoActualizado.categoria;
    fk.precio = updateFunko.precio || funkoActualizado.precio;
    fk.cantidad = updateFunko.cantidad || funkoActualizado.cantidad;
    fk.imagen = updateFunko.imagen || funkoActualizado.imagen;
    fk.isDeleted = updateFunko.isDeleted !=null ? updateFunko.isDeleted : funkoActualizado.isDeleted;
    fk.createdAt = funkoActualizado.createdAt;
    fk.updatedAt = new Date();
    return fk;
  }

  toResponse(funko: Funko): ResponseFunkoDto {
    let responseFunkoDto: ResponseFunkoDto = new ResponseFunkoDto();
    responseFunkoDto.id = funko.id;
    responseFunkoDto.nombre = funko.nombre;
    responseFunkoDto.categoria = funko.categoria.toString();
    responseFunkoDto.precio = funko.precio;
    responseFunkoDto.cantidad = funko.cantidad;
    responseFunkoDto.imagen = funko.imagen;
    responseFunkoDto.isDeleted = funko.isDeleted;
    return responseFunkoDto;
  }
}
