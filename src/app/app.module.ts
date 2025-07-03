import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecadosModule } from '../recados/recados.module';
import { PessoaModule } from '../pessoa/pessoa.module';
import { SimpleMiddleware } from 'src/common/middlewares/simple.middleware';
import { MyExceptionFilter } from 'src/common/filters/my-exception.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as "postgres",
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT!,
      username: process.env.DATABASE_USERNAME,
      database: process.env.DATABASE_DATABASE,
      password: process.env.DATABASE_PASSWORD,
      autoLoadEntities: Boolean(process.env.DATABASE_AUTO_LOAD_ENTITIES),
      synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE),
    }),
    RecadosModule,
    PessoaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: MyExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: MyExceptionFilter,
    },
  ],
})
export class AppModule {}
