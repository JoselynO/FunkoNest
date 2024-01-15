import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { ResponseCategoriaDto } from "./dto/response-categoria.dto";
import { Categoria } from "./entities/categoria.entity";
import { NotFoundException } from "@nestjs/common";
import { CreateCategoriaDto } from "./dto/create-categoria.dto";
import { UpdateCategoriaDto } from "./dto/update-categoria.dto";
import { CacheModule } from "@nestjs/cache-manager";
import { Paginated } from "nestjs-paginate";

describe('CategoriasController', () => {
  let controller: CategoriasController;
  let service: CategoriasService;

  const mockCategoriaService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [CategoriasController],
      providers: [
        { provide: CategoriasService, useValue: mockCategoriaService},
      ],
    }).compile();

    controller = module.get<CategoriasController>(CategoriasController);
    service = module.get<CategoriasService>(CategoriasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of categorias response', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'categorias',
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
          current: 'categorias?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<ResponseCategoriaDto>

      jest.spyOn(service, 'findAll').mockResolvedValue(testCategorias)
      const result: any = await controller.findAll(paginateOptions)

      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.links.current).toEqual(
        `categorias?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=nombre:ASC`,
      )
      expect(service.findAll).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return a categoria', async () => {
      const category: Categoria = new Categoria();
      jest.spyOn(service, 'findOne').mockResolvedValue(category);
      const result = await controller.findOne('9def16db-362b-44c4-9fc9-77117758b5b0');
      expect(result).toEqual(category);
      expect(service.findOne).toHaveBeenCalled();
    })

    it("should throw an error if category doesn't exist", async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('9def16db-362b-44c4-9fc9-77117758b5b0')).rejects.toThrow(NotFoundException);
    });
  })

  describe('create', () => {
    it('should create a new categoria', async () => {
      const createCategoriaDto: CreateCategoriaDto = {
        nombre: 'MARVEL'
      }
      const response: ResponseCategoriaDto = new ResponseCategoriaDto();
      jest.spyOn(service, 'create').mockResolvedValue(response);
      const result = await controller.create(createCategoriaDto);
      expect(result).toEqual(response);
      expect(service.create).toHaveBeenCalledWith(createCategoriaDto);
    })
  })

  describe('update', () => {
    it("should update an existing category", async () => {
      const updateCategoriaDto: UpdateCategoriaDto = {
        nombre: 'DISNEY',
        isDeleted: true,
      }
      const response: ResponseCategoriaDto = new ResponseCategoriaDto();

      jest.spyOn(service, 'update').mockResolvedValue(response);

      const result = await controller.update('9def16db-362b-44c4-9fc9-77117758b5b0', updateCategoriaDto);

      expect(result).toEqual(response);
      expect(service.update).toHaveBeenCalledWith('9def16db-362b-44c4-9fc9-77117758b5b0', updateCategoriaDto);
    });

    it("should throw an error if category doesn't exist", async () => {
      const updateCategoriaDto: UpdateCategoriaDto = {
        nombre: 'HOLS',
        isDeleted: true,
      }
      jest.spyOn(service, 'update').mockRejectedValue(new NotFoundException());
      await expect(controller.update('9def16db-362b-44c4-9fc9-77117758b5b0', updateCategoriaDto)).rejects.toThrow(NotFoundException);
    });
  })

});