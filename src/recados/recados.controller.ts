import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TimingConnectionInterceptor } from 'src/common/interceptors/timing-connection.interceptor';
import { ReqDataParam } from 'src/common/params/req-data-param.decorator';
import { RegexProtocol } from 'src/common/regex/regex.protocol';
import { RemoveSpacesRegex } from 'src/common/regex/remove-spaces.regex';
import { ONLY_LOWERCASE_LETTERS_REGEX, REMOVE_SPACES_REGEX } from './recados.constants';

@Controller('recados')
export class RecadosController {
  constructor(
    private readonly recadosService: RecadosService,
    @Inject(REMOVE_SPACES_REGEX)
    private readonly removeSpacesRegex: RegexProtocol,
    @Inject(ONLY_LOWERCASE_LETTERS_REGEX)
    private readonly onlyLowerCaseRegex: RegexProtocol
  ) {}

  @Get()
  @UseInterceptors(TimingConnectionInterceptor)
  async findAll(@Query() paginationDto: PaginationDto) {
    console.log(this.removeSpacesRegex.execute('Ola Mundo'))
    console.log(this.onlyLowerCaseRegex.execute('Ola Mundo'))
    return await this.recadosService.findAll(paginationDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.recadosService.delete(id);
  }

  @Post()
  async create(@Body() novoRecado: CreateRecadoDto) {
    return await this.recadosService.create(novoRecado);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateRecadoDto: UpdateRecadoDto,
  ) {
    return this.recadosService.update(id, updateRecadoDto);
  }
}
