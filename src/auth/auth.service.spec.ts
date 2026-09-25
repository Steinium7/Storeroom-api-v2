import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: jest.Mocked<
    Pick<UserService, 'findByUsername' | 'findByEmail' | 'create'>
  >;

  const plainPassword = 'correct-horse';
  let storedUser: Record<string, unknown>;

  beforeAll(async () => {
    storedUser = {
      id: 1,
      username: 'jdoe',
      email: 'jdoe@example.com',
      firstname: 'John',
      lastname: 'Doe',
      password: await bcrypt.hash(plainPassword, 4),
    };
  });

  beforeEach(async () => {
    userService = {
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      providers: [AuthService, { provide: UserService, useValue: userService }],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  describe('signIn', () => {
    it('returns a signed JWT and the user without the password hash', async () => {
      userService.findByUsername.mockResolvedValue(storedUser as any);

      const result = await service.signIn('jdoe', plainPassword);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toMatchObject({ id: 1, username: 'jdoe' });

      const payload = await jwtService.verifyAsync(result.access_token);
      expect(payload).toMatchObject({
        id: 1,
        username: 'jdoe',
        email: 'jdoe@example.com',
      });
    });

    it('returns null when the password is wrong', async () => {
      userService.findByUsername.mockResolvedValue(storedUser as any);

      await expect(service.signIn('jdoe', 'wrong')).resolves.toBeNull();
    });

    it('returns null when the user does not exist', async () => {
      userService.findByUsername.mockResolvedValue(null);

      await expect(service.signIn('ghost', plainPassword)).resolves.toBeNull();
    });
  });

  describe('signUp', () => {
    const dto: CreateUserDto = {
      username: 'jdoe',
      password: plainPassword,
      email: 'jdoe@example.com',
      firstname: 'John',
      lastname: 'Doe',
      phone: undefined,
    };

    it('creates the user when the email is free', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.create.mockResolvedValue({ id: 1 } as any);

      await expect(service.signUp(dto)).resolves.toEqual({ id: 1 });
      expect(userService.create).toHaveBeenCalledWith(dto);
    });

    it('returns null and creates nothing when the email is taken', async () => {
      userService.findByEmail.mockResolvedValue(storedUser as any);

      await expect(service.signUp(dto)).resolves.toBeNull();
      expect(userService.create).not.toHaveBeenCalled();
    });
  });
});
