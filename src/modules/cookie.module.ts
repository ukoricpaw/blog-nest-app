import { Module } from '@nestjs/common';
import CookieService from 'src/services/cookie.service';

@Module({
  providers: [CookieService],
  exports: [CookieService],
})
export default class CookieModule {}
