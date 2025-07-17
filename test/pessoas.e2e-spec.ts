import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import globalConfig from 'src/global-config/global.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { RecadosModule } from 'src/recados/recados.module';
import { PessoaModule } from 'src/pessoa/pessoa.module';
import * as path from 'path';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { AppModule } from 'src/app/app.module';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id.pipe';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePessoaDto } from 'src/pessoa/dto/create-pessoa.dto';
import { AuthModule } from 'src/auth/auth.module';
import appConfig from 'src/app/app.config';

const login = async (
  app: INestApplication,
  email: string,
  password: string,
) => {
  const response = await request(app.getHttpServer())
    .post('/auth')
    .send({ email, password });

  return response.body.accessToken;
};

const createUserAndLogin = async (app: INestApplication) => {
  const nome = 'Any User';
  const email = 'anyuser@email.com';
  const password = '123456';

  await request(app.getHttpServer()).post('/pessoa').send({
    email,
    password,
    nome,
  });

  return login(app, email, password);
};

describe('pessoaController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
          ConfigModule.forRoot(),
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule.forFeature(appConfig)],
            inject: [appConfig.KEY],
            useFactory: async (appConfigurations: ConfigType<typeof appConfig>) => {
              return {
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'postgres',
                database: 'testing',
                password: 'carlos123',
                autoLoadEntities: true,
                synchronize: true,
                dropSchema: true
              };
            },
          }),
          ServeStaticModule.forRoot({
            rootPath: path.resolve(__dirname, '..', '..', 'pictures'),
            serveRoot: '/pictures'
          }),
          RecadosModule,
          PessoaModule,
          AuthModule,
        ],
    }).compile();

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: false,
      }),
      new ParseIntIdPipe(),
    );
    await app.init();

    authToken = await createUserAndLogin(app);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /pessoa', () => {
    it('deve criar uma pessoa sem erros', async () => {
      const createPessoaDto: CreatePessoaDto = {
        email: 'Carlos@email.com',
        password: '123456',
        nome: 'Carlos',
      };
      const response = await request(app.getHttpServer())
        .post('/pessoa')
        .send(createPessoaDto)
        .expect(HttpStatus.CREATED);

      console.log(response)

      expect(response.body).toEqual({
        active: true,
        createdAt: expect.any(String),
        email: createPessoaDto.email,
        id: expect.any(Number),
        nome: createPessoaDto.nome,
        passwordHash: expect.any(String),
        picture: '',
        updatedAt: expect.any(String),
      });
    });

    it('deve gerar um erro de e-mail já existe', async () => {
      const createPessoaDto: CreatePessoaDto = {
        email: 'Carlos@email.com',
        nome: 'Carlos',
        password: '123456',
      };

      await request(app.getHttpServer())
        .post('/pessoa')
        .send(createPessoaDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/pessoa')
        .send(createPessoaDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toBe('E-mail já cadastrado.');
    });

    it('deve gerar um erro de senha curta', async () => {
      const createPessoaDto: CreatePessoaDto = {
        email: 'Carlos@email.com',
        nome: 'Carlos',
        password: '123',
      };

      const response = await request(app.getHttpServer())
        .post('/pessoa')
        .send(createPessoaDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual([
        'password must be longer than or equal to 5 characters',
      ]);
    });
  });

  describe('GET /pessoa', () => {
    it('deve retornar todas as pessoa', async () => {
      await request(app.getHttpServer())
        .post('/pessoa')
        .send({
          email: 'Carlos@email.com',
          nome: 'Carlos',
          password: '123456',
        })
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get('/pessoa')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            email: 'Carlos@email.com',
            nome: 'Carlos',
          }),
        ]),
      );
    });
  });

  describe('GET /pessoa/:id', () => {
    it('deve retornar uma pessoa pelo ID', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/pessoa')
        .send({
          email: 'Carlos@email.com',
          nome: 'Carlos',
          password: '123456',
        })
        .expect(HttpStatus.CREATED);

      const personId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/pessoa/${personId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: personId,
          email: 'Carlos@email.com',
          nome: 'Carlos',
        }),
      );
    });

    it('deve retornar erro para pessoa não encontrada', async () => {
      await request(app.getHttpServer())
        .get('/pessoa/9999') // ID fictício
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /pessoa/:id', () => {
    it('deve atualizar uma pessoa', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/pessoa')
        .send({
          email: 'Carlos@email.com',
          nome: 'Carlos',
          password: '123456',
        })
        .expect(HttpStatus.CREATED);

      const personId = createResponse.body.id;

      const authToken = await login(app, 'Carlos@email.com', '123456');

      const updateResponse = await request(app.getHttpServer())
        .patch(`/pessoa/${personId}`)
        .send({
          nome: 'Carlos Atualizado',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(updateResponse.body).toEqual(
        expect.objectContaining({
          id: personId,
          nome: 'Carlos Atualizado',
        }),
      );
    });

    it('deve retornar erro para pessoa não encontrada', async () => {
      await request(app.getHttpServer())
        .patch('/pessoa/9999') // ID fictício
        .send({
          nome: 'Nome Atualizado',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /pessoa/:id', () => {
    it('deve remover uma pessoa', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/pessoa')
        .send({
          email: 'Carlos@email.com',
          nome: 'Carlos',
          password: '123456',
        })
        .expect(HttpStatus.CREATED);

      const authToken = await login(app, 'Carlos@email.com', '123456');

      const personId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/pessoa/${personId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.email).toBe('Carlos@email.com');
    });

    it('deve retornar erro para pessoa não encontrada', async () => {
      await request(app.getHttpServer())
        .delete('/pessoa/9999') // ID fictício
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});