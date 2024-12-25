import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/models/user.model';
import { Company } from 'src/models/company.model';
import { randomInt } from 'crypto';

@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto) {
    const company = await Company.create({ name: `Company ${randomInt(5)}` });

    let user = await User.create({
      ...createUserDto,
      companyId: company.id,
      superAdmin: new Date(),
    });

    company.update({ admin: user.email });

    return user;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findByUsername(username: string) {
    return await User.findOne({ where: { username }, raw: true });
  }

  async findByEmail(email: string) {
    return await User.findOne({ where: { email } });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
