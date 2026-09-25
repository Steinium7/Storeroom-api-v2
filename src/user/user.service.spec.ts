import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { Company } from '../models/company.model';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get(UserService);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('create', () => {
    it('creates a company and registers the user as its super admin', async () => {
      const company = { id: 7, update: jest.fn() };
      const createdUser = { id: 1, email: 'jdoe@example.com' };
      const companyCreate = jest
        .spyOn(Company, 'create')
        .mockResolvedValue(company as any);
      const userCreate = jest
        .spyOn(User, 'create')
        .mockResolvedValue(createdUser as any);

      const dto = {
        username: 'jdoe',
        email: 'jdoe@example.com',
        password: 'secret',
      } as CreateUserDto;

      await expect(service.create(dto)).resolves.toBe(createdUser);

      expect(companyCreate).toHaveBeenCalledWith(
        expect.objectContaining({ name: expect.stringMatching(/^Company /) }),
      );
      expect(userCreate).toHaveBeenCalledWith({
        ...dto,
        companyId: 7,
        superAdmin: expect.any(Date),
      });
      expect(company.update).toHaveBeenCalledWith({
        admin: 'jdoe@example.com',
      });
    });
  });

  describe('lookups', () => {
    it('finds a user by username as a plain object', async () => {
      const findOne = jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await service.findByUsername('jdoe');

      expect(findOne).toHaveBeenCalledWith({
        where: { username: 'jdoe' },
        raw: true,
      });
    });

    it('finds a user by email', async () => {
      const findOne = jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await service.findByEmail('jdoe@example.com');

      expect(findOne).toHaveBeenCalledWith({
        where: { email: 'jdoe@example.com' },
      });
    });
  });
});
