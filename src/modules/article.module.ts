import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import ArticleController from 'src/controllers/article.controller';
import DatabaseModule from 'src/database/database.module';
import CheckUserMiddleware from 'src/middleware/check-user.middleware';
import ArticleRepo from 'src/repositories/article/article.repository';
import ArticleService from 'src/services/article.service';
import TokenModule from './token.module';
import FirebaseModule from 'src/database/firebase.module';
import IsUserValidated from 'src/middleware/is-user-validated';
import ImageController from 'src/controllers/image.controller';
import CommentController from 'src/controllers/comment.controller';
import CommentService from '../services/comment.service';
import UserRepo from '../repositories/user/user.repository';

@Module({
  controllers: [ArticleController, ImageController, CommentController],
  providers: [ArticleRepo, ArticleService, UserRepo, CheckUserMiddleware, CommentService],
  imports: [DatabaseModule, TokenModule, FirebaseModule],
})
export default class ArticleModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(CheckUserMiddleware)
      .forRoutes(
        { path: 'article/:id', method: RequestMethod.GET },
        { path: 'article', method: RequestMethod.GET },
        { path: 'article/search', method: RequestMethod.GET },
        { path: 'comment/:articleId', method: RequestMethod.GET },
      );

    consumer
      .apply(IsUserValidated)
      .forRoutes(
        { path: 'article/:id/rate', method: RequestMethod.POST },
        { path: 'article', method: RequestMethod.POST },
        { path: 'article/:id', method: RequestMethod.DELETE },
        { path: 'article/:id', method: RequestMethod.PATCH },
        { path: 'article/user', method: RequestMethod.GET },
        { path: 'invite/:link', method: RequestMethod.GET },
        { path: 'article/:id/permission', method: RequestMethod.POST },
        { path: 'article/:id/permission/:userId', method: RequestMethod.DELETE },
        { path: 'comment/:articleId', method: RequestMethod.POST },
        { path: 'comment/:articleId/:commentId', method: RequestMethod.DELETE },
        { path: 'comment/:articleId/:commentId', method: RequestMethod.PUT },
        { path: 'comment/:commentId/rate', method: RequestMethod.PATCH },
      );
  }
}
