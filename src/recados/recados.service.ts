import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recado } from './entities/recados.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RecadosService {
  constructor(
    @InjectRepository(Recado)
    private readonly recadoRepository: Repository<Recado>
  ) {}

  async findAll() {
    const recados = await this.recadoRepository.find();
    return recados;
  }
}
