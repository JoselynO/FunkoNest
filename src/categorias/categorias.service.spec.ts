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
import { NotificationsGateway } from "../websockets/notifications/notifications.gateway";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager'
import { Paginated } from "nestjs-paginate";

describe('CategoriasService', () => {
  let service: CategoriasService;
  let repositor: Repository<Categoria>;
  let funkoRepository: Repository<Funko>
  let mapper: CategoriaMapper;
  let notificationsGateway: NotificationsGateway;
  let cacheManager: Cache

  const categoryMapper = {
    toCreate: jest.fn(),
    toUpdate: jest.fn(),
    toResponse: jest.fn(),
  }

  const notificationsGatewayMock = {
    sendMessage: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriasService,
        {provide: CategoriaMapper, useValue: categoryMapper},
        {provide: getRepositoryToken(Categoria), useClass: Repository},
        {provide: getRepositoryToken(Funko), useClass: Repository},
        {provide: NotificationsGateway, useValue: notificationsGatewayMock},
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
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
    notificationsGateway = module.get<NotificationsGateway>(NotificationsGateway)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

 describe('findAll', () => {
   it("should return an array of responses categories", async ()  => {
     const paginateOptions = {
       page: 1,
       limit: 10,
       path: 'categorias'
     }

     const testCategorias = {
       data: [],
       meta: {
         itemsPerPage: 10,
         totalItems: 1,
         currentPage: 1,
         totalPages: 1,
       },
       links: {
         current: 'categorias?page=1&limit=10&sortBy=nombre:ASC'
       },
     } as Paginated<ResponseCategoriaDto>

     jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
     jest.spyOn(cacheManager, 'set').mockResolvedValue()

     const mockQueryBuilder = {
       take: jest.fn().mockReturnThis(),
       skip: jest.fn().mockReturnThis(),
       addOrderBy: jest.fn().mockReturnThis(),
       getManyAndCount: jest.fn().mockResolvedValue([]),
     }
     jest
       .spyOn(repositor, 'createQueryBuilder')
       .mockReturnValue(mockQueryBuilder as any)

     jest
       .spyOn(mapper, 'toResponse')
       .mockReturnValue(new ResponseCategoriaDto())

     const result: any = await service.findAll(paginateOptions);

     expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit);
     expect(result.meta.currentPage).toEqual(paginateOptions.page)
     expect(result.links.current).toEqual(
       `categorias?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=nombre:ASC`
     )
     expect(cacheManager.get).toHaveBeenCalled()
     expect(cacheManager.set).toHaveBeenCalled()
   });
 })

 describe('findOne', () => {
    it("should return a reponse category", async ()  => {
      const category : Categoria = new Categoria();
      category.id = '9def16db-362b-44c4-9fc9-77117758b5b0';
      category.nombre = 'MARVEL';
      category.createdAt = new Date();
      category.updatedAt = new Date();
      category.isDeleted = false;
      category.funkos = [];

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(category);
      jest.spyOn(cacheManager, 'set').mockResolvedValue()


      const categoryFound : Categoria = await service.findOne('9def16db-362b-44c4-9fc9-77117758b5b0');
      expect(categoryFound).toEqual(category);
      expect(categoryFound).toBeInstanceOf(Categoria);
    });

    it("should thrown an error if the category doesn't exist", async ()  => {
      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(null);
      await expect(service.findOne('9def16db-362b-44c4-9fc9-77117758b5b0')).rejects.toThrow(NotFoundException);
    });
  })

  describe('create', () => {
    it("should return a new category response", async ()  => {
      const createCategoryDto: CreateCategoriaDto = {
        nombre : 'DISNEY'
      }
      const category : Categoria = new Categoria();
      category.id = '9def16db-362b-44c4-9fc9-77117758b5b0';
      category.nombre = 'DISNEY';
      category.createdAt = new Date();
      category.updatedAt = new Date();
      category.isDeleted = false;
      category.funkos = [];

      const response: ResponseCategoriaDto = new ResponseCategoriaDto();
      response.id = '9def16db-362b-44c4-9fc9-77117758b5b0';
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
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      const newCategory : ResponseCategoriaDto = await service.create(createCategoryDto);
      expect(newCategory).toEqual(response);
      expect(newCategory).toBeInstanceOf(ResponseCategoriaDto);
    });

    it("should thrown an error if category already exists", async ()  => {
      const createCategoryDto: CreateCategoriaDto = {
        nombre : 'DISNEY'
      }

      const category : Categoria = new Categoria();
      category.id = '9def16db-362b-44c4-9fc9-77117758b5b0';
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
      categoriaActual.id = '9def16db-362b-44c4-9fc9-77117758b5b0';
      categoriaActual.nombre = 'PELICULAS';
      categoriaActual.createdAt = new Date();
      categoriaActual.updatedAt = new Date();
      categoriaActual.isDeleted = false;
      categoriaActual.funkos = [];

      const result: ResponseCategoriaDto = new ResponseCategoriaDto();
      result.id = '9def16db-362b-44c4-9fc9-77117758b5b0';
      result.nombre = 'Updated Category';
      result.isDeleted = true;

      const categoriaActualizada: Categoria = new Categoria();
      categoriaActualizada.id = '9def16db-362b-44c4-9fc9-77117758b5b0';
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

      const updatedCategory : ResponseCategoriaDto = await service.update('9def16db-362b-44c4-9fc9-77117758b5b0', updateCategoryDto);
      expect(updatedCategory).toEqual(result);
      expect(updatedCategory).toBeInstanceOf(ResponseCategoriaDto);
      expect(notificationsGateway.sendMessage).toHaveBeenCalled();
    });


    it("should thrown an error if the id doesn't match with any category", async ()  => {
      const updateCategoryDto: UpdateCategoriaDto = {
        nombre : 'Updated Category',
        isDeleted: true
      }
      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(null);
      await expect(service.update('9def16db-362b-44c4-9fc9-77117758b5b0', updateCategoryDto)).rejects.toThrow(NotFoundException)
    });

    it("should thrown an error if the category's name already exist on BD", async ()  => {
      const updateCategoryDto: UpdateCategoriaDto = {
        nombre : 'Categoria Test'
      }
      const category: Categoria = new Categoria();
      category.id = '9def16db-362b-44c4-9fc9-77117758b5b0';
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
      const testCategoryResponse: ResponseCategoriaDto = new ResponseCategoriaDto();
      testCategoryResponse.id = '1';
      testCategoryResponse.isDeleted = true;
      testCategoryResponse.nombre =  "Updated Category"

      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(repositor, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(testCategory)
      jest.spyOn(repositor, 'remove').mockResolvedValue(testCategory)

      expect(await service.remove('1')).toEqual(testCategoryResponse)
    })
});

  describe('removeSoft', () => {
    it('should call the soft delete method', async () => {
      const testCategory = new Categoria()
      const testCategoryResponse: ResponseCategoriaDto = new ResponseCategoriaDto();
      testCategoryResponse.id = '1';
      testCategoryResponse.isDeleted = true;
      jest.spyOn(mapper, 'toResponse').mockReturnValue(testCategoryResponse);
      jest.spyOn(repositor, 'findOneBy').mockResolvedValue(testCategory)
      jest.spyOn(repositor, 'save').mockResolvedValue(testCategory)

      expect(await service.removeSoft('1')).toEqual(testCategoryResponse)
    })
  })
});