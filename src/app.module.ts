import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecadosModule } from './recados/recados.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      database: 'postgres',
      password: 'carlos123',
      autoLoadEntities: true,
      synchronize: true,
    }),
    RecadosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
