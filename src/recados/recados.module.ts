import { forwardRef, Module } from '@nestjs/common';
import { RecadosController } from './recados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recado } from './entities/recados.entity';
import { RecadosService } from './recados.service';
import { PessoaModule } from 'src/pessoa/pessoa.module';
import { MyDynamicModule } from 'src/my-dynamic/my-dynamic.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recado]),
    forwardRef(() => PessoaModule),
    MyDynamicModule.register({
      apiKey: 'Aq vem a apiKey',
      apiUrl: 'http://localhost:3000',
    }),
  ],
  controllers: [RecadosController],
  providers: [RecadosService],
})
export class RecadosModule {}
