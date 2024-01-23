import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API REST Tienda FunkoNest')
    .setDescription(
      'API de Funkos, API REST con Nestjs.',
    )
    .setContact(
      'Joselyn Carolina Obando Fernandez',
      'https://github.com/JoselynO',
      'cariharvey@hotmail.com',
    )
    .setExternalDoc(
      'Documentación de la API',
      'https://github.com/JoselynO/FunkoNest.git',
    )
    .setLicense('CC BY-NC-SA 4.0', 'https://github.com/JoselynO/FunkoNest.git')
    .setVersion('1.0.0')
    .addTag('Funkos', 'Operaciones con funkos')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document) // http://localhost:3000/api
}