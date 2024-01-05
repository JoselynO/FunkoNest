import { INestApplication, NotFoundException } from "@nestjs/common";
import { Categoria } from "../../src/categorias/entities/categoria.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { CategoriasController } from "../../src/categorias/categorias.controller";
import { CategoriasService } from "../../src/categorias/categorias.service";
import * as request from 'supertest';

describe('CategoriasController (e2e)', () => {
  let app: INestApplication
  const myEndpoint = `/categorias`

  const myCategoria: Categoria = {
    id: '9def16db-362b-44c4-9fc9-77117758b5b0',
    nombre: 'MARVEL',
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    funkos: [],
  }

  const createCategoriaDto = {
    nombre: 'MARVEL',
  }

  const updateCategoriaDto = {
    nombre: 'DISNEY',
    isDeleted: false,
  }

  const mockCategoriasService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeSoft: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasController],
      providers: [
        CategoriasService,
        { provide: CategoriasService, useValue: mockCategoriasService },
      ],
    })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /categorias', () => {
    it('should return an array of categorias', async () => {
      mockCategoriasService.findAll.mockResolvedValue([myCategoria])

      const { body } = await request(app.getHttpServer())
        .get(myEndpoint)
        .expect(200)
      expect(() => {
        expect(body).toEqual([myCategoria])
        expect(mockCategoriasService.findAll).toHaveBeenCalled()
      })
    })
  })

  describe('GET /categorias/:id', () => {
    it('should return a single categoria', async () => {
      mockCategoriasService.findOne.mockResolvedValue(myCategoria)

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${myCategoria.id}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(myCategoria)
        expect(mockCategoriasService.findOne).toHaveBeenCalled()
      })
    })

    it('should throw an error if the category does not exist', async () => {
      mockCategoriasService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${myCategoria.id}`)
        .expect(404)
    })
  })

  describe('POST /categorias', () => {
    it('should create a new categoria', async () => {
      mockCategoriasService.create.mockResolvedValue(myCategoria)

      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createCategoriaDto)
        .expect(201)
      expect(() => {
        expect(body).toEqual(myCategoria)
        expect(mockCategoriasService.create).toHaveBeenCalledWith(
          createCategoriaDto,
        )
      })
    })
  })

  describe('PUT /categorias/:id', () => {
    it('should update a categoria', async () => {
      mockCategoriasService.update.mockResolvedValue(myCategoria)

      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${myCategoria.id}`)
        .send(updateCategoriaDto)
        .expect(200)
      expect(() => {
        expect(body).toEqual(myCategoria)
        expect(mockCategoriasService.update).toHaveBeenCalledWith(
          myCategoria.id,
          updateCategoriaDto,
        )
      })
    })

    it('should throw an error if the category does not exist', async () => {
      mockCategoriasService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${myEndpoint}/${myCategoria.id}`)
        .send(updateCategoriaDto)
        .expect(404)
    })
  })

})