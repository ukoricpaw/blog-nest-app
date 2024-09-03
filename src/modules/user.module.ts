import { Module } from '@nestjs/common';
import UserController from 'src/controllers/user.controller';
import UserService from 'src/services/user.service';
import TokenModule from './token.module';
import DatabaseModule from 'src/database/database.provider';
import UserRepo from 'src/repositories/user/user.repository';
import CookieModule from './cookie.module';
import CheckAuthGuard from 'src/guards/check-auth.guard';
import CheckAccessTokenGuard from 'src/guards/check-access-token.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepo, CheckAuthGuard, CheckAccessTokenGuard],
  imports: [TokenModule, DatabaseModule, CookieModule],
})
export default class UserModule {}
