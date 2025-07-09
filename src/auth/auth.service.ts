import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { Repository } from "typeorm";
import { Pessoa } from "src/pessoa/entities/pessoa.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { HashingService } from "./hashing/hashing.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
    private readonly hashingService: HashingService,
  ) {}
  async login(loginDto: LoginDto) {
    let passwordIsValid = false
    let throwError = true

    const pessoa = await this.pessoaRepository.findOneBy({
      email: loginDto.email
    })
    if (pessoa) {
      passwordIsValid = await this.hashingService.compare(
        loginDto.password,
        pessoa.passwordHash
      )
    }

    if (passwordIsValid) {
      throwError = false
    }

    if (throwError) {
      throw new UnauthorizedException('Usuário ou senha inválidos.')
    }

    return loginDto
  }
}