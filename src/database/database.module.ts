import { Module } from '@nestjs/common';
import { databaseProviders } from './database.provider';
import { tokenProviders } from 'src/repositories/token/token.provider';
import { userProviders } from 'src/repositories/user/user.provider';
import { articleProviders } from 'src/repositories/article/article.provider';

@Module({
  providers: [...databaseProviders, ...tokenProviders, ...userProviders, ...articleProviders],
  exports: [...databaseProviders, ...tokenProviders, ...userProviders, ...articleProviders],
})
export default class DatabaseModule {}
