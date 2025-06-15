import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recado } from './entities/recados.entity';
import { Repository } from 'typeorm';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';

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
 async create(createRecadoDto: CreateRecadoDto) {
  const novoRecado = {
    ...createRecadoDto,
    lido: false,
    data: new Date(),
  };

  const recado = this.recadoRepository.create(novoRecado)
  return await this.recadoRepository.save(recado)
 }

 async delete(id: number) {
  await this.recadoRepository.delete({
    id: id
  })

  return "sucesso"
 }

 async update(id: number, updateRecadoDto: UpdateRecadoDto) {
  const partialUpdateRecadoDto = {
    lido: updateRecadoDto?.lido,
    texto: updateRecadoDto?.texto,
  }

  const recado = await this.recadoRepository.preload({
    id,
    ...partialUpdateRecadoDto
  });

  if (!recado) throw new Error('Not found.');

  return this.recadoRepository.save(recado);
 }
}
