import { Module } from '@nestjs/common';
import UserController from 'src/controllers/user.controller';
import UserService from 'src/services/user.service';
import TokenModule from './token.module';
import DatabaseModule from 'src/database/database.provider';
import UserRepo from 'src/repositories/user/user.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepo],
  imports: [TokenModule, DatabaseModule],
})
export default class UserModule {}
