import { Module } from '@nestjs/common';
import { databaseProviders } from './database.module';
import { tokenProviders } from 'src/repositories/token/token.provider';
import { userProviders } from 'src/repositories/user/user.provider';

@Module({
  providers: [...databaseProviders, ...tokenProviders, ...userProviders],
  exports: [...databaseProviders, ...tokenProviders, ...userProviders],
})
export default class DatabaseModule {}
