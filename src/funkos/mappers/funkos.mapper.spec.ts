// @ts-ignore

import { FunkosMapper } from "./funkos.mapper";
import { Categoria } from "../../categorias/entities/categoria.entity";
import { CreateFunkoDto } from "../dto/create-funko.dto";
import { UpdateFunkoDto } from "../dto/update-funko.dto";
import { Funko } from "../entities/funko.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { ResponseFunkoDto } from "../dto/response-funko.dto";

describe('FunkosMapper', () => {
  let funkosMapper: FunkosMapper;

  const categoria : Categoria = {
    id: '8c5c06ba-49d6-46b6-85cc-8246c0f362bc',
    nombre: 'MARVEL',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos:[]
  }

  const createFunkoDto: CreateFunkoDto ={
    nombre: 'Hulk',
    precio: 9.99,
    cantidad: 30,
    imagen: 'hulk.jpg',
    categoria: categoria.nombre
  }

  const updateFunkoDto: UpdateFunkoDto = {
    nombre: ' Reina',
    precio: 2.99,
    cantidad: 15,
    imagen: 'reina.jpg'
  }

  const funko: Funko = {
    id: 1,
    nombre: 'Cenicienta',
    precio: 9.99,
    cantidad: 10,
    imagen: 'cenicienta.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    categoria: categoria,
    isDeleted: false,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkosMapper]
    }).compile()

    funkosMapper = module.get<FunkosMapper>(FunkosMapper);
  })

  it("should be defined", () => {
    expect(funkosMapper).toBeDefined();
  });

  it("should map CreateFunkoDto to Funko", () => {
    const actualFunko: Funko = funkosMapper.toCreate(createFunkoDto, categoria);

    expect(actualFunko).toBeInstanceOf(Funko);
    expect(actualFunko.id).toBeUndefined()
    expect(actualFunko.nombre).toEqual(createFunkoDto.nombre);
    expect(actualFunko.precio).toEqual(createFunkoDto.precio);
    expect(actualFunko.cantidad).toEqual(createFunkoDto.cantidad);
    expect(actualFunko.imagen).toEqual(createFunkoDto.imagen);
    expect(actualFunko.createdAt).toBeDefined();
    expect(actualFunko.updatedAt).toBeDefined();
    expect(actualFunko.categoria).toEqual(categoria);
    expect(actualFunko.isDeleted).toBeFalsy();
  });

  it("should map UpdateFunkoDto to Funko", () => {
    const actualFunko: Funko = funkosMapper.toUpdate( updateFunkoDto,funko, categoria)

    expect(actualFunko).toBeInstanceOf(Funko);
    expect(actualFunko.id).toEqual(funko.id)
    expect(actualFunko.nombre).toEqual(updateFunkoDto.nombre);
    expect(actualFunko.precio).toEqual(updateFunkoDto.precio);
    expect(actualFunko.cantidad).toEqual(updateFunkoDto.cantidad);
    expect(actualFunko.imagen).toEqual(updateFunkoDto.imagen);
    expect(actualFunko.createdAt).toEqual(funko.createdAt);
    expect(actualFunko.updatedAt).toBeDefined();
    expect(actualFunko.categoria).toEqual(categoria);
    expect(actualFunko.isDeleted).toEqual(funko.isDeleted)
  });

  it("should map Funko to FunkoResponseDto", () => {
    const actualResponse: ResponseFunkoDto = funkosMapper.toResponse(funko);

    expect(actualResponse).toBeInstanceOf( ResponseFunkoDto);
    expect(actualResponse.id).toEqual(funko.id)
    expect(actualResponse.nombre).toEqual(funko.nombre);
    expect(actualResponse.precio).toEqual(funko.precio);
    expect(actualResponse.cantidad).toEqual(funko.cantidad);
    expect(actualResponse.imagen).toEqual(funko.imagen);
    expect(actualResponse.categoria).toEqual(funko.categoria.nombre);
    expect(actualResponse.isDeleted).toEqual(funko.isDeleted)
  });
})
