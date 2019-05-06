import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../types/user';
import { RegisterDTO, LoginDTO } from '../auth/auth.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  sanitizeUser(user: User) {
    return user.depopulate('password');
  }

  async create(userDTO: RegisterDTO) {
    const { username } = userDTO;
    const user = await this.userModel.findOne({ username });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const createdUser = new this.userModel(userDTO);
    await createdUser.save();
    return this.sanitizeUser(createdUser);
  }

  async findByLogin(userDTO: LoginDTO) {
    const { username, password } = userDTO;
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    if (await bcrypt.compare(password, user.password)) {
      return this.sanitizeUser(user);
    } else {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }
}
