import * as process from 'process'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    // Configurar el módulo de base de datos de Postgres
    // TypeOrm
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT) || 5432,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        autoLoadEntities: true,
        entities: [`${__dirname}/**/*.entity{.js}`],
        synchronize: process.env.NODE_ENV === 'dev',
        logging: process.env.NODE_ENV === 'dev' ? 'all' : false,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
