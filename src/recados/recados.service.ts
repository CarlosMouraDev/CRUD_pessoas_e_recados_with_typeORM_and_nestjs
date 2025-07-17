import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recado } from './entities/recados.entity';
import { Repository } from 'typeorm';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PessoaService } from 'src/pessoa/pessoa.service';
import { NotFoundError } from 'rxjs';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { EmailService } from 'src/email/email.service';
import { ResponseRecadoDto } from './dto/response-recado.dto';

@Injectable()
export class RecadosService {
  constructor(
    @InjectRepository(Recado)
    private readonly recadoRepository: Repository<Recado>,
    private readonly pessoaService: PessoaService,
    private readonly emailService: EmailService
  ) {}

  async findAll(paginationDto: PaginationDto): Promise<ResponseRecadoDto[]> {
    const { limit = 10, offset = 0 } = paginationDto;

    const recados = await this.recadoRepository.find({
      take: limit,
      skip: offset,
      relations: ['de', 'para'],
      order: {
        id: 'DESC',
      },
      select: {
        de: {
          id: true,
          nome: true,
        },
        para: {
          id: true,
          nome: true,
        },
      },
    });
    return recados;
  }

  async findOne(id: number): Promise<ResponseRecadoDto> {
    const recados = await this.recadoRepository.findOne({
      relations: ['de', 'para'],
      order: {
        id: 'DESC',
      },
      select: {
        de: {
          id: true,
          nome: true,
        },
        para: {
          id: true,
          nome: true,
        },
      },
    });

    if (!recados) throw new NotFoundError('Recado não encontrado');

    return recados;
  }
  async create(
    createRecadoDto: CreateRecadoDto,
    tokenPayload: TokenPayloadDto,
  ) : Promise<ResponseRecadoDto> {
    const { paraId } = createRecadoDto;

    const de = await this.pessoaService.findOne(tokenPayload.sub);

    const para = await this.pessoaService.findOne(paraId);

    const novoRecado = {
      texto: createRecadoDto.texto,
      de,
      para,
      lido: false,
      data: new Date(),
    };
    const recado = this.recadoRepository.create(novoRecado);
    await this.recadoRepository.save(recado);

    // await this.emailService.sendEmail(
    //   para.email,
    //   `Você recebeu um recado de: ${de.nome}`,
    //   createRecadoDto.texto
    // )

    return {
      ...recado,
      de: {
        id: recado.de.id,
        nome: recado.de.nome,
      },
      para: {
        id: recado.para.id,
        nome: recado.para.nome,
      },
    };
  }

  async delete(id: number, tokenPayload: TokenPayloadDto): Promise<ResponseRecadoDto> {
    const recado = await this.findOne(id);

    if (recado.de.id !== tokenPayload.sub) {
      throw new ForbiddenException('Esse recado não é seu.');
    }

    await this.recadoRepository.delete({
      id: id,
    });

    return recado
  }

  async update(
    id: number,
    updateRecadoDto: UpdateRecadoDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const recado = await this.findOne(id);

    if (recado.de.id !== tokenPayload.sub) {
      throw new ForbiddenException('Esse recado não é seu.');
    }

    recado.texto = updateRecadoDto?.texto ?? recado.texto;
    recado.lido = updateRecadoDto?.lido ?? recado.lido;
    await this.recadoRepository.save(recado);

    return this.recadoRepository.save(recado);
  }
}
