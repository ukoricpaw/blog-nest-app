import { Module } from '@nestjs/common';
import ArticleController from 'src/controllers/article.controller';
import DatabaseModule from 'src/database/database.provider';
import ArticleRepo from 'src/repositories/article/article.repository';

@Module({
  providers: [ArticleRepo, ArticleController],
  imports: [DatabaseModule],
})
export default class ArticleModule {}
