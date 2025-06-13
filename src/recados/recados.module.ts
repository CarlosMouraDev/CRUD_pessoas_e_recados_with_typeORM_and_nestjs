import { Module } from '@nestjs/common';
import { RecadosController } from './recados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recado } from './entities/recados.entity';
import { RecadosService } from './recados.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recado])],
  controllers: [RecadosController],
  providers: [RecadosService]
})
export class RecadosModule {}
