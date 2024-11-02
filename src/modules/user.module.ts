import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import UserController from 'src/controllers/user.controller';
import UserService from 'src/services/user.service';
import TokenModule from './token.module';
import DatabaseModule from 'src/database/database.module';
import UserRepo from 'src/repositories/user/user.repository';
import CookieModule from './cookie.module';
import CheckAuthGuard from 'src/guards/check-auth.guard';
import CheckAccessTokenGuard from 'src/guards/check-access-token.guard';
import IsUserValidated from '../middleware/is-user-validated';
import FirebaseModule from '../database/firebase.module';
import ArticleRepo from '../repositories/article/article.repository';

@Module({
  controllers: [UserController],
  providers: [UserService, IsUserValidated, UserRepo, CheckAuthGuard, CheckAccessTokenGuard, ArticleRepo],
  imports: [TokenModule, DatabaseModule, CookieModule, FirebaseModule],
})
export default class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(IsUserValidated).forRoutes({ path: 'user', method: RequestMethod.PATCH });
  }
}
