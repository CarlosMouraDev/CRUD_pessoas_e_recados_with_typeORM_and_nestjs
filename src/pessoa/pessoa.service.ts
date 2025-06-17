import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PessoaService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>
  ){}

  async create(createPessoaDto: CreatePessoaDto) {
    try {
      const pessoaData = {
      nome: createPessoaDto.nome,
      passwordHash: createPessoaDto.password,
      email: createPessoaDto.email
    };

    const novaPessoa = this.pessoaRepository.create(pessoaData);
    await this.pessoaRepository.save(novaPessoa);
    return novaPessoa;
    } catch (error) {
      if(error.code === '23505') {
        throw new ConflictException('E-mail já cadastrado.');
      }

      throw error;
    }
  }

  async findAll() {
    return await this.pessoaRepository.find({
      order: {
        id: 'ASC'
      }
    })
  }

  async findOne(id: number) {
    try {
      const found = await this.pessoaRepository.findOneBy({
        id: id
      })

      if (!found) {
        throw new NotFoundException('Pessoa não encontrada.')
      }

      return found;
    } catch (error) {
      throw error
    }
  }

  async update(id: number, updatePessoaDto: UpdatePessoaDto) {
    try {
      const pessoaData = {
      nome: updatePessoaDto.nome,
      passwordHash: updatePessoaDto.password,
      email: updatePessoaDto.email
    };

    const updated = await this.pessoaRepository.preload({
      id,
      ...pessoaData
    });
    if (!updated) {
      throw new NotFoundException('Pessoa não encontrada.')
    }

    return this.pessoaRepository.save(updated);
    } catch (error) {
      if(error.code === '23505') {
        throw new ConflictException('E-mail já cadastrado.');
      }

      throw error;
    }
  }

  async remove(id: number) {
    const person = await this.pessoaRepository.findOneBy({
      id
    })

    if(!person) {
      throw new NotFoundException('Pessoa não encontrada.')
    }

    await this.pessoaRepository.remove(person)
  }
}
