import { Controller, Get } from '@nestjs/common';
import { RecadosService } from './recados.service';

@Controller('recados')
export class RecadosController {
  constructor(private readonly recadosService: RecadosService) {}

  @Get()
  async findAll() {
    return await this.recadosService.findAll();
  }
}
