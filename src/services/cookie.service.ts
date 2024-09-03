import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export default class CookieService {
  saveTokens(res: Response, tokens: { access: string; refresh: string }) {
    res.cookie('refreshToken', tokens.refresh, { httpOnly: true, maxAge: 1000 * 60 * 60 });
    res.cookie('accessToken', tokens.access, { httpOnly: true, maxAge: 1000 * 60 * 15 });
  }

  clearCookies(res: Response) {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
  }
}
