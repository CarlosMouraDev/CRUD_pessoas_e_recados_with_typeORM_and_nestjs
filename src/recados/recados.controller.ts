import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';

@Controller('recados')
export class RecadosController {
  constructor(private readonly recadosService: RecadosService) {}

  @Get()
  async findAll() {
    return await this.recadosService.findAll();
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.recadosService.delete(id)
  }

  @Post()
  async create(@Body() novoRecado: CreateRecadoDto) {
    return await this.recadosService.create(novoRecado);
  }
};
