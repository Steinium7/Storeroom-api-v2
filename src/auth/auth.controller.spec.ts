import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'signIn' | 'signUp'>>;

  beforeEach(async () => {
    authService = { signIn: jest.fn(), signUp: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('signIn', () => {
    it('returns the token payload for valid credentials', async () => {
      const result = { access_token: 'token', user: { id: 1 } };
      authService.signIn.mockResolvedValue(result);

      await expect(
        controller.signIn({ username: 'jdoe', password: 'secret' }),
      ).resolves.toBe(result);
      expect(authService.signIn).toHaveBeenCalledWith('jdoe', 'secret');
    });

    it('throws 401 for invalid credentials', async () => {
      authService.signIn.mockResolvedValue(null);

      await expect(
        controller.signIn({ username: 'jdoe', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('signUp', () => {
    const dto = {
      username: 'jdoe',
      email: 'jdoe@example.com',
    } as CreateUserDto;

    it('returns the created user', async () => {
      authService.signUp.mockResolvedValue({ id: 1 });

      await expect(controller.signUp(dto)).resolves.toEqual({ id: 1 });
    });

    it('throws 400 when the user already exists', async () => {
      authService.signUp.mockResolvedValue(null);

      await expect(controller.signUp(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
