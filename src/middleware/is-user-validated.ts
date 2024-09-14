import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import TokenService from 'src/services/token.service';
import { Request } from 'src/types/overwritten-request';

@Injectable()
export default class IsUserValidated implements NestMiddleware {
  constructor(private tokenService: TokenService) {}
  use(req: Request, res: Response, next: (error?: Error | any) => void) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) throw new UnauthorizedException('Unauthorized');
    const data = this.tokenService.verifyAccessToken(accessToken);
    req.user = data;
    next();
  }
}
