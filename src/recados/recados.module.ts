import { Module } from '@nestjs/common';
import { RecadosController } from './recados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recado } from './entities/recados.entity';
import { RecadosService } from './recados.service';
import { PessoaModule } from 'src/pessoa/pessoa.module';

@Module({
  imports: [TypeOrmModule.forFeature([Recado]), PessoaModule],
  controllers: [RecadosController],
  providers: [RecadosService]
})
export class RecadosModule {}
