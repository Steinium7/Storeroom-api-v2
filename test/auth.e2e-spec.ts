import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { UserService } from '../src/user/user.service';
import { User } from '../src/models/user.model';
import { CreateUserDto } from '../src/user/dto/create-user.dto';

/**
 * Exercises the auth HTTP layer (routing, validation, status codes, JWT)
 * against an in-memory user store, so no database is needed.
 */
class InMemoryUserService {
  private users: Array<CreateUserDto & { id: number }> = [];

  async create(dto: CreateUserDto) {
    const user = { ...dto, id: this.users.length + 1 };
    await User.hashPassword(user as unknown as User);
    this.users.push(user);
    return user;
  }

  async findByUsername(username: string) {
    return this.users.find((u) => u.username === username) ?? null;
  }

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const newUser = {
    username: 'jdoe',
    password: 'correct-horse',
    email: 'jdoe@example.com',
    firstname: 'John',
    lastname: 'Doe',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'e2e-secret' })],
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UserService, useClass: InMemoryUserService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jwtService = moduleRef.get(JwtService);
  });

  afterAll(() => app.close());

  describe('POST /auth/register', () => {
    it('rejects an invalid payload with 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...newUser, email: 'not-an-email' })
        .expect(400);

      expect(res.body.message).toContain('Email must be a valid email address');
    });

    it('creates a user with 201', () =>
      request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201));

    it('rejects a duplicate email with 400', () =>
      request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(400));
  });

  describe('POST /auth/login', () => {
    it('returns a valid JWT for correct credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: newUser.username, password: newUser.password })
        .expect(200);

      expect(res.body.user).not.toHaveProperty('password');
      await expect(
        jwtService.verifyAsync(res.body.access_token),
      ).resolves.toMatchObject({ username: 'jdoe', email: 'jdoe@example.com' });
    });

    it('returns 401 for a wrong password', () =>
      request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: newUser.username, password: 'wrong' })
        .expect(401));

    it('returns 401 for an unknown user', () =>
      request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'ghost', password: 'whatever' })
        .expect(401));
  });
});
