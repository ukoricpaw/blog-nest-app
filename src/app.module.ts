import { Module } from '@nestjs/common';
import DatabaseModule from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import UserModule from './modules/user.module';
import ArticleModule from './modules/article.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    ArticleModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
  ],
})
export class AppModule {}
