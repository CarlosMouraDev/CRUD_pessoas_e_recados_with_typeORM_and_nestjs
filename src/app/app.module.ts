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
import { MyExceptionFilter } from 'src/common/filters/my-exception.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigType } from '@nestjs/config';
import appConfig from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(appConfig)],
      inject: [appConfig.KEY],
      useFactory: async (appConfigurations: ConfigType<typeof appConfig>) => {
        return {
          type: appConfigurations.database.type,
          host: appConfigurations.database.host,
          port: appConfigurations.database.port,
          username: appConfigurations.database.username,
          password: appConfigurations.database.password,
          autoLoadEntities: appConfigurations.database.autoLoadEntities,
          synchronize: appConfigurations.database.synchronize,
        }
      }
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
