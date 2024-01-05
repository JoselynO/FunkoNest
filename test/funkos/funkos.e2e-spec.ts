import { INestApplication, NotFoundException } from "@nestjs/common";
import { Categoria } from "../../src/categorias/entities/categoria.entity";
import { ResponseFunkoDto } from "../../src/funkos/dto/response-funko.dto";
import { CreateFunkoDto } from "../../src/funkos/dto/create-funko.dto";
import { UpdateFunkoDto } from "../../src/funkos/dto/update-funko.dto";
import { Test, TestingModule } from "@nestjs/testing";
import { FunkosController } from "../../src/funkos/funkos.controller";
import { FunkosService } from "../../src/funkos/funkos.service";
import * as request from 'supertest';

describe('FunkosController (e2e)', () => {
  let app: INestApplication;
  const myEndpoint = `/funkos`;

  const myCategoria: Categoria = {
    id: 'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9',
    nombre: 'MARVEL',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: []
  }

  const  responseFunkoDto:  ResponseFunkoDto = {
    id: 1,
    nombre: "Harry Potter",
    precio: 9.99,
    cantidad: 10,
    categoria: 'MARVEL',
    imagen: 'harryPotter.png',
    isDeleted: false,
  }

  const createFunkoDto: CreateFunkoDto = {
    nombre: "Rampunzel",
    precio: 12.99,
    cantidad: 10,
    categoria: myCategoria.nombre,
    imagen: 'rampunzel.png'
  }

  const updateFunkoDto: UpdateFunkoDto = {
    nombre: "Hulk",
    precio: 19.99,
    cantidad: 72,
    imagen: 'hulk.png',
  }

  const mockFunkosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [FunkosController],
      providers: [
        FunkosService,
        { provide: FunkosService, useValue: mockFunkosService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  })

  describe(`GET /funkos`, () => {
    it("should return an array of funks response", async () => {
      mockFunkosService.findAll.mockResolvedValue([ ResponseFunkoDto])

      const {body} = await request(app.getHttpServer())
        .get(myEndpoint)
        .expect(200)
      expect(() => {
        expect(body).toEqual([ responseFunkoDto]);
        expect(mockFunkosService.findAll).toHaveBeenCalled();
      })
    });
  })

  describe('GET /funkos/:id', () => {
    it("should return a single funk response", async () => {
      mockFunkosService.findOne.mockResolvedValue(responseFunkoDto)

      const {body} = await request(app.getHttpServer())
        .get(`${myEndpoint}/${responseFunkoDto.id}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(responseFunkoDto);
        expect(mockFunkosService.findOne).toHaveBeenCalled();
      })
    })

    it("should throw an error if the funk doesn't exist", async () => {
      mockFunkosService.findOne.mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${responseFunkoDto.id}`)
        .expect(404)
    });
  });

  describe('POST /funkos', () => {
    it("should create a new funk", async () => {
      mockFunkosService.create.mockResolvedValue(responseFunkoDto)

      const {body} = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createFunkoDto)
        .expect(201)
      expect(() => {
        expect(body).toEqual(responseFunkoDto);
        expect(mockFunkosService.create).toHaveBeenCalledWith(createFunkoDto);
      });
    });
  });

  describe('PUT /funkos/:id', () => {
    it("should update a funk", async () => {
      mockFunkosService.update.mockResolvedValue(responseFunkoDto);

      const {body} = await request(app.getHttpServer())
        .put(`${myEndpoint}/${responseFunkoDto.id}`)
        .send(updateFunkoDto)
        .expect(200);
      expect(() => {
        expect(body).toEqual(responseFunkoDto);
        expect(mockFunkosService.update).toHaveBeenCalledWith(responseFunkoDto.id, updateFunkoDto);
      });
    });

    it("should thrown an error if the funk doesn't exist", async () => {
      mockFunkosService.update.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .put(`${myEndpoint}/${responseFunkoDto.id}`)
        .send(updateFunkoDto)
        .expect(404);
    });
  });

  describe('DELETE /funkos/:id', () => {
    it("should remove a category", async () => {
      mockFunkosService.remove.mockResolvedValue(responseFunkoDto);

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${responseFunkoDto.id}`)
        .expect(204);
    });

    it("should throw an error if the funk doesn't exist", async () => {
      mockFunkosService.remove.mockRejectedValue(new NotFoundException());
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${responseFunkoDto.id}`)
        .expect(404);
    });
  });
});