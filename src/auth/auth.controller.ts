import {
  Body,
  Controller,
  HttpCode,
  Post,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: any) {
    let result = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );

    if (!result) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return result;
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
