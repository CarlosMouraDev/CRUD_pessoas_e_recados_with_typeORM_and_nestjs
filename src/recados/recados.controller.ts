import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TimingConnectionInterceptor } from 'src/common/interceptors/timing-connection.interceptor';
import { MY_DYNAMIC_CONFIG, MyDynamicModuleConfigs } from 'src/my-dynamic/my-dynamic.module';

@Controller('recados')
export class RecadosController {
  constructor(
    private readonly recadosService: RecadosService,
    @Inject(MY_DYNAMIC_CONFIG)
    private readonly myDinamicConfigs: MyDynamicModuleConfigs,
  ) {
    console.log(this.myDinamicConfigs)
  }

  @Get()
  @UseInterceptors(TimingConnectionInterceptor)
  async findAll(@Query() paginationDto: PaginationDto) {
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
