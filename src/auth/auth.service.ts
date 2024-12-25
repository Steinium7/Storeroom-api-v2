import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);

    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async signUp(signUpDto: CreateUserDto): Promise<any> {
    let user = await this.userService.findByEmail(signUpDto.email);

    if (user) {
      return null;
    }

    return await this.userService.create(signUpDto);
  }
}
