import { Module } from '@nestjs/common';
import { RecadosController } from './recados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recado } from './entities/recados.entity';
import { RecadosService } from './recados.service';
import { PessoaModule } from 'src/pessoa/pessoa.module';
import { RemoveSpacesRegex } from 'src/common/regex/remove-spaces.regex';
import { OnlyLowercaseLettersRegex } from 'src/common/regex/only-lowercase-letters.regex';
import { ONLY_LOWERCASE_LETTERS_REGEX, REMOVE_SPACES_REGEX } from './recados.constants';

@Module({
  imports: [TypeOrmModule.forFeature([Recado]), PessoaModule],
  controllers: [RecadosController],
  providers: [
    RecadosService,
    {
      provide: ONLY_LOWERCASE_LETTERS_REGEX,
      useClass: OnlyLowercaseLettersRegex
    },
    {
      provide: REMOVE_SPACES_REGEX,
      useClass: RemoveSpacesRegex
    },
  ],
})
export class RecadosModule {}
