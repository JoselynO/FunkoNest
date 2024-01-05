import { CategoriaMapper } from "./categoria-mapper";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateCategoriaDto } from "../dto/create-categoria.dto";
import { Categoria } from "../entities/categoria.entity";
import { UpdateCategoriaDto } from "../dto/update-categoria.dto";
import { ResponseCategoriaDto } from "../dto/response-categoria.dto";

describe('CategoriasMapper', () => {
  let provider: CategoriaMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriaMapper],
    }).compile()

    provider = module.get<CategoriaMapper>(CategoriaMapper)
  })

  it("should be defined", () => {
    expect(provider).toBeDefined()
  });

  describe('CategoriaMapper', () => {
    let categoriaMapper: CategoriaMapper

    beforeEach(async () =>{
      const module: TestingModule = await Test.createTestingModule({
        providers: [CategoriaMapper],
      }).compile()

      categoriaMapper = module.get<CategoriaMapper>(CategoriaMapper)
    })

    it ('should be defined', () => {
      expect(categoriaMapper).toBeDefined()
    })

    it("should map CreateCategoriaDto to Categoria", () => {
      const createCategoriaDto: CreateCategoriaDto = {
        nombre: 'CreateCategoria'
      }

      const actualCategoria: Categoria = categoriaMapper.toCreate(createCategoriaDto);

      expect(actualCategoria.nombre).toEqual(createCategoriaDto.nombre.toUpperCase())
      expect(actualCategoria.id).toBeUndefined()
      expect(actualCategoria.createdAt).toBeDefined()
      expect(actualCategoria.updatedAt).toBeDefined()
      expect(actualCategoria.isDeleted).toBeFalsy()
    });

    it("should map UpdateCategoriaDto to Categoria", () => {
      const updateCategoriaDto: UpdateCategoriaDto = {
        nombre: 'Updated Category',
        isDeleted: true,
      }

      const categoriaToUpdate : Categoria = {
        id: '9def16db-362b-44c4-9fc9-77117758b5b0',
        nombre: 'DISNEY'.toUpperCase(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        funkos: []
      }

      const actualCategoria: Categoria = categoriaMapper.toUpdate(updateCategoriaDto, categoriaToUpdate);

      expect(actualCategoria.nombre).toEqual(updateCategoriaDto.nombre.toUpperCase())
      expect(actualCategoria.id).toEqual(categoriaToUpdate.id)
      expect(actualCategoria.createdAt).toEqual(categoriaToUpdate.createdAt)
      expect(actualCategoria.updatedAt).toBeDefined()
      expect(actualCategoria.isDeleted).toEqual(updateCategoriaDto.isDeleted)
    });

    it("should map Categoria to ReponseCategoriaDto", () => {
      const categoria : Categoria = {
        id: '9def16db-362b-44c4-9fc9-77117758b5b0',
        nombre: 'DISNEY',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        funkos: []
      }
      const actualResponse: ResponseCategoriaDto = categoriaMapper.toResponse(categoria)

      expect(actualResponse.id).toEqual(categoria.id)
      expect(actualResponse.nombre).toEqual(categoria.nombre)
      expect(actualResponse.isDeleted).toEqual(categoria.isDeleted)
    });
  });
});