import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { Funko } from "./entities/funko.entity";
import { FunkosMapper } from "./mappers/funkos.mapper";

@Injectable()
export class FunkosService {
  funkos: Funko[] = []
  nextId: number = 1

  constructor(private readonly funkoMapper: FunkosMapper) {
  }

  async create(createFunkoDto: CreateFunkoDto) {
    const newFunko = this.funkoMapper.toCreate(createFunkoDto)
    newFunko.id = this.nextId++
    this.funkos.push(newFunko)
    return newFunko
  }

  async findAll() {
    return this.funkos
  }

  async findOne(id: number) {
    const funko = this.funkos.find((funko) => funko.id == id)
    if (!funko) {
      throw new NotFoundException(`Funko #${id} no encontrado`)
    }
    return funko
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    if(!updateFunkoDto || Object.keys(updateFunkoDto).length === 0) {
      throw new BadRequestException('No se han enviado datos para actualizar');
    }
    const funkoActualizado = await this.findOne(id)
    const funkoIndex = this.funkos.indexOf(funkoActualizado);
    this.funkos[funkoIndex] = this.funkoMapper.toUpdate(updateFunkoDto, funkoActualizado)
    return this.funkos[funkoIndex];
  }

  async remove(id: number) {
    const funkoBorrado = await this.findOne(id)
    this.funkos.splice(this.funkos.indexOf(funkoBorrado), 1)
  }
}
