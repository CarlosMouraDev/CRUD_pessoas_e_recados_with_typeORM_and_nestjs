import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UseInterceptors, UsePipes } from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id.pipe';
import { AddHeaderInterceptor } from 'src/common/interceptors/add-header.interceptor';

@Controller('recados')
@UsePipes(ParseIntIdPipe)
export class RecadosController {
  constructor(private readonly recadosService: RecadosService) {}

  @Get()
  @UseInterceptors(AddHeaderInterceptor)
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.recadosService.findAll(paginationDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.recadosService.delete(id)
  }

  @Post()
  async create(@Body() novoRecado: CreateRecadoDto) {
    return await this.recadosService.create(novoRecado);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateRecadoDto: UpdateRecadoDto) {
    return this.recadosService.update(id, updateRecadoDto)
  }
};
