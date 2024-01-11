import { Test, TestingModule } from '@nestjs/testing';
import { FunkosController } from './funkos.controller';
import { FunkosService } from './funkos.service';
import { ResponseFunkoDto } from "./dto/response-funko.dto";
import { NotFoundException } from "@nestjs/common";
import { CreateFunkoDto } from "./dto/create-funko.dto";
import { UpdateFunkoDto } from "./dto/update-funko.dto";
import { Request } from 'express'
import { CacheModule } from "@nestjs/cache-manager";

describe('FunkosController', () => {
  let controller: FunkosController;
  let service: FunkosService;

  const funkosSeviceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateImage: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [FunkosController],
      providers: [{ provide: FunkosService, useValue: funkosSeviceMock}],
    }).compile();

    controller = module.get<FunkosController>(FunkosController);
    service = module.get<FunkosService>(FunkosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a response of all funks', async () => {
      const expectedResult :  ResponseFunkoDto[] = [new  ResponseFunkoDto(), new  ResponseFunkoDto()];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      const actualResult = await controller.findAll();
      expect(actualResult).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  })

  describe('findOne', () => {
    it('should return a response of a funk', async () => {
      const expectedResult :  ResponseFunkoDto = new  ResponseFunkoDto();

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      const actualResult = await controller.findOne(1);
      expect(actualResult).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalled();
    });

    it("should throw an error if funk doesn't exist", async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException);
    });
  })

  describe('create', () => {
    it('should create a new funk', async () => {
      const createFunkoDto: CreateFunkoDto = {
        nombre: 'Rampunzel',
        precio: 29.99,
        cantidad: 58,
        imagen: 'rampunzel.jpg',
        categoria: 'DISNEY',
      }
      const expectedResult :  ResponseFunkoDto = new  ResponseFunkoDto();

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      const actualResult = await controller.create(createFunkoDto);
      expect(actualResult).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createFunkoDto);
      expect(actualResult).toBeInstanceOf( ResponseFunkoDto);
    })
  })

  describe('update', () => {
    it('should update a funk', async () => {
      const updateFunkoDto: UpdateFunkoDto = {
        nombre: 'Harry Potter',
        precio: 19.99,
        cantidad: 5,
        imagen: 'harryPotter.jpg',
        categoria: 'PELICULAS',
      }
      const expectedResult: ResponseFunkoDto = new ResponseFunkoDto();

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      const actualResult = await controller.update(1, updateFunkoDto);
      expect(actualResult).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateFunkoDto);
      expect(actualResult).toBeInstanceOf(ResponseFunkoDto);
    })

    it("should throw an error if funk doesn't exist", () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());
      expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  })

  describe('remove', () => {
    it('should remove a funk', async () => {
      const expectedResult : ResponseFunkoDto = new  ResponseFunkoDto();

      jest.spyOn(service,'remove').mockResolvedValue(expectedResult);

      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    })

    it("should thrown an error if funk doesn`t exist", async () => {
      jest.spyOn(service,'remove').mockRejectedValue(new NotFoundException());
      await expect(controller.remove(1)).rejects.toThrow(NotFoundException);
    });
  })

  describe('updateImage', () => {
    it('should update a funko image', async () => {
      const mockId = 1
      const mockFile = {} as Express.Multer.File
      const mockReq = {} as Request
      const mockResult: ResponseFunkoDto = new ResponseFunkoDto()

      jest.spyOn(service, 'updateImage').mockResolvedValue(mockResult)

      await controller.updateImage(mockId, mockFile, mockReq)
      expect(service.updateImage).toHaveBeenCalledWith(
        mockId,
        mockFile,
        mockReq,
        true,
      )
      expect(mockResult).toBeInstanceOf(ResponseFunkoDto)
    })
  })
})