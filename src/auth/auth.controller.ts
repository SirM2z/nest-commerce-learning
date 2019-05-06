import { Controller, Post } from '@nestjs/common';
import { UserService } from '../shared/user.service';
import { LoginDTO, RegisterDTO } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private userService: UserService) {}

  @Post('login')
  login(userDto: LoginDTO) {
    return this.userService.findByLogin(userDto);
  }

  @Post('register')
  register(userDto: RegisterDTO) {
    return this.userService.create(userDto);
  }
}
