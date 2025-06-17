import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recado } from './entities/recados.entity';
import { Repository } from 'typeorm';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { Pessoa } from 'src/pessoa/entities/pessoa.entity';
import { PessoaService } from 'src/pessoa/pessoa.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class RecadosService {
  constructor(
    @InjectRepository(Recado)
    private readonly recadoRepository: Repository<Recado>,
    private readonly pessoaService: PessoaService
  ) {}

  async findAll() {
    const recados = await this.recadoRepository.find({
      relations: ['de', 'para'],
      order: {
        id: 'DESC'
      },
      select: {
        de: {
          id: true,
          nome: true
        },
        para: {
          id: true,
          nome: true
        }
      }
    });
    return recados;
  }

  async findOne(id: number) {
    const recados = await this.recadoRepository.findOne({
      relations: ['de', 'para'],
      order: {
        id: 'DESC'
      },
      select: {
        de: {
          id: true,
          nome: true
        },
        para: {
          id: true,
          nome: true
        }
      }
    });

    if(!recados) throw new NotFoundError("Recado não encontrado")
    
    return recados;
  }
 async create(createRecadoDto: CreateRecadoDto) {
  const { deId, paraId } = createRecadoDto;

  const de = await this.pessoaService.findOne(deId)

  const para = await this.pessoaService.findOne(paraId)

  const novoRecado = {
    texto: createRecadoDto.texto,
    de,
    para,
    lido: false,
    data: new Date(),
  };
  const recado = this.recadoRepository.create(novoRecado)
  await this.recadoRepository.save(recado)

  return {
    ...recado,
    de: {
      id: recado.de.id,
      nome: recado.de.nome
    },
    para: {
      id: recado.para.id,
      nome: recado.para.nome
    },
  }
 }

 async delete(id: number) {
  await this.recadoRepository.delete({
    id: id
  })

  return "sucesso"
 }

 async update(id: number, updateRecadoDto: UpdateRecadoDto) {

  const recado = await this.findOne(id)

  recado.texto = updateRecadoDto?.texto ?? recado.texto;
  recado.lido = updateRecadoDto?.lido ?? recado.lido;
  await this.recadoRepository.save(recado);


  return this.recadoRepository.save(recado);
 }
}
