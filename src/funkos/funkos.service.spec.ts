import { Test, TestingModule } from '@nestjs/testing';
import { FunkosService } from './funkos.service';
import { Repository } from 'typeorm';
import { Funko } from './entities/funko.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { FunkosMapper } from './mappers/funkos.mapper';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResponseFunkoDto } from "./dto/response-funko.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateFunkoDto } from "./dto/create-funko.dto";
import { UpdateFunkoDto } from "./dto/update-funko.dto";
import { StorageService } from "../storage/storage.service";
import { NotificationsGateway } from "../websockets/notifications/notifications.gateway";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager'

describe('FunkosService', () => {
  let service: FunkosService;
  let funkosRepository: Repository<Funko>;
  let categoriaRepository: Repository<Categoria>;
  let mapper: FunkosMapper;
  let storageService: StorageService;
  let notificationsGateway: NotificationsGateway;
  let cacheManager: Cache;

  const funkoMapperMock = {
    toCreate: jest.fn(),
    toUpdate: jest.fn(),
    toResponse: jest.fn(),
  }

  const storageServiceMock = {
    removeFile: jest.fn(),
    getFileNameWithouUrl: jest.fn(),
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
      providers: [FunkosService,
        {provide: getRepositoryToken(Funko), useClass: Repository},
        {provide: getRepositoryToken(Categoria), useClass: Repository},
        {provide: FunkosMapper, useValue: funkoMapperMock},
        {provide: StorageService, useValue: storageServiceMock},
        {provide: NotificationsGateway, useValue: notificationsGatewayMock},
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },],
    }).compile();

    service = module.get<FunkosService>(FunkosService);
    funkosRepository = module.get(getRepositoryToken(Funko));
    categoriaRepository = module.get(getRepositoryToken(Categoria));
    mapper = module.get<FunkosMapper>(FunkosMapper);
    storageService = module.get<StorageService>(StorageService);
    notificationsGateway = module.get<NotificationsGateway>(NotificationsGateway);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of funkos response', async () => {
      const response: ResponseFunkoDto = new ResponseFunkoDto();
      const resultado: ResponseFunkoDto[] = [
        new ResponseFunkoDto(),
        new ResponseFunkoDto(),
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(resultado),
      }
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      jest
        .spyOn(funkosRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(mapper, 'toResponse').mockReturnValue(response);

      expect(await service.findAll()).toEqual(resultado)
    })
  })

   describe('findOne', () => {
      it('should retrieve a funk by id', async () => {
        const resultado = new Funko();
        const resultadoDto = new ResponseFunkoDto();
        const mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(resultado),
        }

        jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
        jest
          .spyOn(funkosRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

        jest.spyOn(mapper, 'toResponse').mockReturnValue(resultadoDto)
        jest.spyOn(cacheManager, 'set').mockResolvedValue()

        expect(await service.findOne(1)).toEqual(resultadoDto);
        expect(mapper.toResponse).toHaveBeenCalled()
      })

      it("should throw an error if the funk doesn't exist", async () => {
        const mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(undefined),
        }
        jest
          .spyOn(funkosRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)
        await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      });
    })

    describe('create', () => {
      it("should create a new funko response", async () => {
        const categoria: Categoria = new Categoria();
        const funko: Funko = new Funko();
        const funkoCreateDto: CreateFunkoDto = new CreateFunkoDto();
        const resultadoDto: ResponseFunkoDto = new ResponseFunkoDto();
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(categoria),
        }
        jest
          .spyOn(categoriaRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)
        jest.spyOn(mapper, 'toCreate').mockReturnValue(funko)
        jest.spyOn(mapper, 'toResponse').mockReturnValue(resultadoDto)
        jest.spyOn(funkosRepository, 'save').mockResolvedValue(funko);
        jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

        expect(await service.create(funkoCreateDto)).toEqual(resultadoDto)
        expect(mapper.toCreate).toHaveBeenCalled()
        expect(funkosRepository.save).toHaveBeenCalled()
        expect(mapper.toResponse).toHaveBeenCalled()
        expect(notificationsGateway.sendMessage).toHaveBeenCalled();
      })

      it("should throw an error if category doesn't exist", async () => {
        const funkCreateDto: CreateFunkoDto = new CreateFunkoDto();
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(null),
        }
        jest
          .spyOn(categoriaRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

        await expect(service.create(funkCreateDto)).rejects.toThrow(BadRequestException);
      })
    })

    describe('update', () => {
      it("should update an exist funk with an update request", async () => {
        const funkUpdateDto: UpdateFunkoDto = new UpdateFunkoDto();
        funkUpdateDto.nombre = "Harry Potter";
        funkUpdateDto.cantidad = 5;
        funkUpdateDto.precio = 11.99;
        const actualFunk: Funko = new Funko();
        const updatedFunk: Funko = new Funko();
        const resultado:  ResponseFunkoDto = new  ResponseFunkoDto();

        const mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(actualFunk),
        }
        jest
          .spyOn(funkosRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)
        jest.spyOn(mapper, 'toUpdate').mockReturnValue(updatedFunk);
        jest.spyOn(funkosRepository, 'save').mockResolvedValue(updatedFunk);
        jest.spyOn(mapper, 'toResponse').mockReturnValue(resultado);

        expect(await service.update(1, funkUpdateDto)).toEqual(resultado);
        expect(mapper.toResponse).toHaveBeenCalled();
        expect(mapper.toUpdate).toHaveBeenCalled();
        expect(funkosRepository.save).toHaveBeenCalled();
        expect(notificationsGateway.sendMessage).toHaveBeenCalled();
      })


      it("should throw an error if doesn't exist any Funk by id", async () => {
        const funkUpdateDto: UpdateFunkoDto = new UpdateFunkoDto();
        funkUpdateDto.isDeleted = true;

        const mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(undefined),
        }
        jest
          .spyOn(funkosRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

        await expect(service.update(1, funkUpdateDto)).rejects.toThrow(NotFoundException)
      })
    })

    describe('remove', () => {
      it("should call the remove method", async () => {
        const funkToDelete: Funko = new Funko();
        const resultado:  ResponseFunkoDto = new  ResponseFunkoDto();

        const mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(funkToDelete),
        }
        jest
          .spyOn(funkosRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)
        jest.spyOn(funkosRepository, 'remove').mockResolvedValue(funkToDelete);
        jest.spyOn(funkoMapperMock, 'toResponse').mockReturnValue(resultado);

        expect(await service.remove(1)).toEqual(resultado);
        expect(funkosRepository.remove).toHaveBeenCalledTimes(1);
        expect(funkoMapperMock.toResponse).toHaveBeenCalled();
      })

      it("should throw an error if funkoToDelete doesn't exist", async () => {
        const mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(undefined),
        }
        jest
          .spyOn(funkosRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

        await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      })
    })

    describe('removeSoft', () => {
      it("should call the remove soft method", async () => {
        const funkToDelete: Funko = new Funko();
        const expectedResult:  ResponseFunkoDto = new  ResponseFunkoDto();
        expectedResult.isDeleted = true;

        const mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(funkToDelete),
        }
        jest
          .spyOn(funkosRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)
        jest.spyOn(funkosRepository, 'save').mockResolvedValue(funkToDelete);
        jest.spyOn(funkoMapperMock, 'toResponse').mockReturnValue(expectedResult);

        const actualResult = await service.removeSoft(1);

        expect(actualResult.isDeleted).toBeTruthy();
        expect(funkosRepository.save).toHaveBeenCalled()
        expect(funkoMapperMock.toResponse).toHaveBeenCalled()
      })

      it("should throw an error if funkoToDelete doesn't exist", async () => {
        const mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(undefined),
        }
        jest
          .spyOn(funkosRepository, 'createQueryBuilder')
          .mockReturnValue(mockQueryBuilder as any)

        await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      })
    })

  describe('updateImage', () => {
    it('should update a funko image', async () => {
      const mockRequest = {
        protocol: 'http',
        get: () => 'localhost',
      }
      const mockFile = {
        filename: 'new_image',
      }

      const mockFunko = new Funko()
      const mockResponseFunkoDto = new ResponseFunkoDto()

      jest.spyOn(service, 'exists').mockResolvedValue(mockFunko)

      jest
        .spyOn(funkosRepository, 'save')
        .mockResolvedValue(mockFunko)

      jest
        .spyOn(mapper, 'toResponse')
        .mockReturnValue(mockResponseFunkoDto)

      expect(
        await service.updateImage(1, mockFile as any, mockRequest as any, true),
      ).toEqual(mockResponseFunkoDto)

      expect(storageService.removeFile).toHaveBeenCalled()
      expect(storageService.getFileNameWithouUrl).toHaveBeenCalled()
    })
  })
})