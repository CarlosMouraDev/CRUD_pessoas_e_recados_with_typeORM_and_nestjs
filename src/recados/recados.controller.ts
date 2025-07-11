import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TimingConnectionInterceptor } from 'src/common/interceptors/timing-connection.interceptor';
import {
  MY_DYNAMIC_CONFIG,
  MyDynamicModuleConfigs,
} from 'src/my-dynamic/my-dynamic.module';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Controller('recados')
export class RecadosController {
  constructor(
    private readonly recadosService: RecadosService,
    @Inject(MY_DYNAMIC_CONFIG)
    private readonly myDinamicConfigs: MyDynamicModuleConfigs,
  ) {
    console.log(this.myDinamicConfigs);
  }

  @Get()
  @UseInterceptors(TimingConnectionInterceptor)
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.recadosService.findAll(paginationDto);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return await this.recadosService.delete(id, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Post()
  async create(
    @Body() novoRecado: CreateRecadoDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return await this.recadosService.create(novoRecado, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateRecadoDto: UpdateRecadoDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.recadosService.update(id, updateRecadoDto, tokenPayload);
  }
}
