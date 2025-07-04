import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';

@Injectable()
export class PessoaService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
    private readonly hashinfService: HashingService,
  ) {}

  async create(createPessoaDto: CreatePessoaDto) {
    try {
      const passwordHash = await this.hashinfService.hash(
        createPessoaDto.password
      )

      const pessoaData = {
        nome: createPessoaDto.nome,
        passwordHash,
        email: createPessoaDto.email,
      };

      const novaPessoa = this.pessoaRepository.create(pessoaData);
      await this.pessoaRepository.save(novaPessoa);
      return novaPessoa;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('E-mail já cadastrado.');
      }

      throw error;
    }
  }

  async findAll() {
    return await this.pessoaRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    try {
      const found = await this.pessoaRepository.findOneBy({
        id,
      });

      if (!found) {
        throw new NotFoundException('Pessoa não encontrada.');
      }

      return found;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updatePessoaDto: UpdatePessoaDto) {
    try {
      const pessoaData = {
        nome: updatePessoaDto.nome,
        email: updatePessoaDto.email,
      };

      if (updatePessoaDto?.password) {
        const passwordHash = await this.hashinfService.hash(
          updatePessoaDto.password
        )

        pessoaData['passwordHash'] = passwordHash
      }

      const updated = await this.pessoaRepository.preload({
        id,
        ...pessoaData,
      });
      if (!updated) {
        throw new NotFoundException('Pessoa não encontrada.');
      }

      return this.pessoaRepository.save(updated);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('E-mail já cadastrado.');
      }

      throw error;
    }
  }

  async remove(id: number) {
    const person = await this.pessoaRepository.findOneBy({
      id,
    });

    if (!person) {
      throw new NotFoundException('Pessoa não encontrada.');
    }

    await this.pessoaRepository.remove(person);
  }
}
