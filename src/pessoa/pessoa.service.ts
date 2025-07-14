import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from "path"
import * as fs from "fs/promises"

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
        createPessoaDto.password,
      );

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

  async update(
    id: number,
    updatePessoaDto: UpdatePessoaDto,
    tokenPayload: TokenPayloadDto,
  ) {
    try {
      const pessoaData = {
        nome: updatePessoaDto.nome,
        email: updatePessoaDto.email,
      };

      if (updatePessoaDto?.password) {
        const passwordHash = await this.hashinfService.hash(
          updatePessoaDto.password,
        );

        pessoaData['passwordHash'] = passwordHash;
      }

      const updated = await this.pessoaRepository.preload({
        id,
        ...pessoaData,
      });
      if (!updated) {
        throw new NotFoundException('Pessoa não encontrada.');
      }

      if (updated.id !== tokenPayload.sub) {
        throw new ForbiddenException(
          'Você não pode atualizar os dados de outra pessoa.',
        );
      }

      return this.pessoaRepository.save(updated);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('E-mail já cadastrado.');
      }

      throw error;
    }
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const person = await this.pessoaRepository.findOneBy({
      id,
    });

    if (!person) {
      throw new NotFoundException('Pessoa não encontrada.');
    }

    if (person.id !== tokenPayload.sub) {
      throw new ForbiddenException('Você não pode remover outra pessoa.');
    }

    await this.pessoaRepository.remove(person);
  }

  async uploadPicture(file: Express.Multer.File, tokenPayload: TokenPayloadDto) {
    if(file.size < 1024) {
      throw new BadRequestException('File too small')
    }
    
    const pessoa = await this.findOne(tokenPayload.sub)

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1)

    const fileName = `${tokenPayload.sub}.${fileExtension}`

    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName)

    await fs.writeFile(fileFullPath, file.buffer)

    pessoa.picture = fileName
    await this.pessoaRepository.save(pessoa)

    return pessoa
  }
}
