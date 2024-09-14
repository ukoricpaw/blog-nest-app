import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import UserEntity from 'src/models/user.entity';
import TokenService from 'src/services/token.service';
import { Request } from 'src/types/overwritten-request';

@Injectable()
export default class CheckUserMiddleware implements NestMiddleware {
  constructor(private tokenService: TokenService) {}
  use(req: Request, res: Response, next: (error?: Error | any) => void) {
    const accessToken = req.cookies.accessToken;
    let data: UserEntity = null;
    try {
      data = this.tokenService.verifyAccessToken(accessToken);
    } catch (err: any) {}
    req.user = data;
    next();
  }
}
