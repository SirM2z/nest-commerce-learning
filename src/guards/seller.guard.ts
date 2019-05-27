import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SellerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    if (user && user.seller) {
      return true;
    }

    throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);

    // if (!request.headers.authorization) {
    //   return false;
    // }
    // request.user = await this.validateToken(request.headers.authorization);
    // return true;
  }

  async validateToken(auth: string) {
    if (auth.split(' ')[0] !== 'Bearer') {
      throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
    }
    const token = auth.split(' ')[1];
    try {
      const decode = await jwt.verify(token, process.env.SECRET_KEY);
      return decode;
    } catch (error) {
      const message = 'Token error: ' + (error.message || error.name);
      throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }
}
