import {
  Body,
  Controller,
  HttpCode,
  Post,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: any) {
    let user = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    return user;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async signUp(@Body() signUpDto: CreateUserDto) {
    const user = await this.authService.signUp(signUpDto);

    if (!user) {
      throw new BadRequestException('User already exists');
    }

    return user;
  }
}
