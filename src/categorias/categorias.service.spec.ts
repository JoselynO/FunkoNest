import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasService } from './categorias.service';
import { Repository } from "typeorm";
import { Categoria } from "./entities/categoria.entity";
import { Funko } from "../funkos/entities/funko.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ResponseCategoriaDto } from "./dto/response-categoria.dto";
import { CategoriaMapper } from "./mappers/categoria-mapper";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateCategoriaDto } from "./dto/create-categoria.dto";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto";

describe('CategoriasService', () => {
  let service: CategoriasService;
  let repositor: Repository<Categoria>;
  let funkoRepository: Repository<Funko>
  let mapper: CategoriaMapper;

  const categoryMapper = {
    toCreate: jest.fn(),
    toUpdate: jest.fn(),
    toResponse: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriasService,
        {provide: CategoriaMapper, useValue: categoryMapper},
        {provide: getRepositoryToken(Categoria), useClass: Repository},
        {provide: getRepositoryToken(Funko), useClass: Repository},
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
    repositor = module.get<Repository<Categoria>>(
      getRepositoryToken(Categoria),
    )
    funkoRepository = module.get<Repository<Funko>>(
      getRepositoryToken(Funko),
    )
    mapper = module.get<CategoriaMapper>(CategoriaMapper);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

 describe('findAll', () => {
    it("should return an array of responses categories", async ()  => {
      const categories = [new Categoria(), new Categoria(), new Categoria()]
      const response = new ResponseCategoriaDto();
      jest.spyOn(repositor, 'find').mockResolvedValue(categories);
      jest.spyOn(mapper, 'toResponse').mockReturnValue(response);

      const categoriesResult = await service.findAll()
      expect(categoriesResult.length).toBe(3)
      expect(categoriesResult[0]).toBeInstanceOf(ResponseCategoriaDto)
    });
  })

 describe('findOne', () => {
    it("should return a reponse category", async ()  => {
      const category : Categoria = new Categoria();
      category.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      category.nombre = 'MARVEL';
      category.createdAt = new Date();
      category.updatedAt = new Date();
      category.isDeleted = false;
      category.funkos = [];

      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(category);

      const categoryFound : Categoria = await service.findOne('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9');
      expect(categoryFound).toEqual(category);
      expect(categoryFound).toBeInstanceOf(Categoria);
    });

    it("should thrown an error if the category doesn't exist", async ()  => {
      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(null);
      await expect(service.findOne('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9')).rejects.toThrow(NotFoundException);
    });
  })

  describe('create', () => {
    it("should return a new category response", async ()  => {
      const createCategoryDto: CreateCategoriaDto = {
        nombre : 'DISNEY'
      }
      const category : Categoria = new Categoria();
      category.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      category.nombre = 'DISNEY';
      category.createdAt = new Date();
      category.updatedAt = new Date();
      category.isDeleted = false;
      category.funkos = [];

      const response: ResponseCategoriaDto = new ResponseCategoriaDto();
      response.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      response.nombre = 'DISNEY';
      response.isDeleted = false;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }

      jest
        .spyOn(repositor, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(mapper, 'toCreate').mockReturnValue(category)
      jest.spyOn(repositor, 'save').mockResolvedValue(category);
      jest.spyOn(mapper, 'toResponse').mockReturnValue(response);

      const newCategory : ResponseCategoriaDto = await service.create(createCategoryDto);
      expect(newCategory).toEqual(response);
      expect(newCategory).toBeInstanceOf(ResponseCategoriaDto);
    });

    it("should thrown an error if category already exists", async ()  => {
      const createCategoryDto: CreateCategoriaDto = {
        nombre : 'DISNEY'
      }

      const category : Categoria = new Categoria();
      category.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      category.nombre = 'DISNEY';
      category.createdAt = new Date();
      category.updatedAt = new Date();
      category.isDeleted = false;
      category.funkos = [];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }

      jest
        .spyOn(repositor, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      await expect(service.create(createCategoryDto)).rejects.toThrow(BadRequestException);
    });
  })

 describe('update', () => {
    it("should return a category updated response", async ()  => {
      const updateCategoryDto: UpdateCategoriaDto = {
        nombre : 'Updated Category',
        isDeleted: true
      }
      const categoriaActual : Categoria = new Categoria();
      categoriaActual.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      categoriaActual.nombre = 'PELICULAS';
      categoriaActual.createdAt = new Date();
      categoriaActual.updatedAt = new Date();
      categoriaActual.isDeleted = false;
      categoriaActual.funkos = [];

      const result: ResponseCategoriaDto = new ResponseCategoriaDto();
      result.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      result.nombre = 'Updated Category';
      result.isDeleted = true;

      const categoriaActualizada: Categoria = new Categoria();
      categoriaActualizada.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      categoriaActualizada.nombre = 'Updated Category';
      categoriaActualizada.createdAt = categoriaActual.createdAt;
      categoriaActualizada.updatedAt = new Date();
      categoriaActual.funkos = categoriaActual.funkos;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(categoriaActual),
      }

      jest
        .spyOn(repositor, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(categoriaActual)
      jest.spyOn(mapper, 'toUpdate').mockReturnValue(categoriaActualizada)
      jest.spyOn(repositor, 'save').mockResolvedValue(categoriaActualizada);
      jest.spyOn(mapper, 'toResponse').mockReturnValue(result);

      const updatedCategory : ResponseCategoriaDto = await service.update('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9', updateCategoryDto);
      expect(updatedCategory).toEqual(result);
      expect(updatedCategory).toBeInstanceOf(ResponseCategoriaDto);
    });


    it("should thrown an error if the id doesn't match with any category", async ()  => {
      const updateCategoryDto: UpdateCategoriaDto = {
        nombre : 'Updated Category',
        isDeleted: true
      }
      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(null);
      await expect(service.update('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9', updateCategoryDto)).rejects.toThrow(NotFoundException)
    });

    it("should thrown an error if the category's name already exist on BD", async ()  => {
      const updateCategoryDto: UpdateCategoriaDto = {
        nombre : 'Categoria Test'
      }
      const category: Categoria = new Categoria();
      category.id = 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9';
      category.nombre = 'PELICULAS';

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }

      jest
        .spyOn(repositor, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(category);

      await expect(service.update('569cf3db-b77d-4181-b3cd-5ca8107fb6a9', updateCategoryDto)).rejects.toThrow(BadRequestException)
    });
  })

  describe('remove', () => {
    it('should call the delete method', async () => {
      const testCategory = new Categoria()
      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(testCategory)
      jest.spyOn(repositor, 'remove').mockResolvedValue(testCategory)

      expect(await service.remove('1')).toEqual(testCategory)
    })
});

  describe('removeSoft', () => {
    it('should call the soft delete method', async () => {
      const testCategory = new Categoria()
      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(testCategory)
      jest.spyOn(repositor, 'save').mockResolvedValue(testCategory)

      expect(await service.removeSoft('1')).toEqual(testCategory)
    })
  })
});