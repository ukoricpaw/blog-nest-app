import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import FirebaseRepo from 'src/database/firebase.repository';
import Article from 'src/dtos/article.dto';
import CreateArticleDto from 'src/dtos/create-article.dto';
import ArticleEntity from 'src/models/article.entity';
import ArticleRepo from 'src/repositories/article/article.repository';
import { v4 } from 'uuid';

@Injectable()
export default class ArticleService {
  constructor(
    private articleRepo: ArticleRepo,
    private firebaseRepo: FirebaseRepo,
  ) {}
  public checkIsArticleExist(article: ArticleEntity | null) {
    if (!article) throw new BadRequestException("Article doesn't exist");
  }

  public async checkRolesOfArticle(article: ArticleEntity, userId: number | undefined) {
    if (userId) {
      const userRoles = await this.articleRepo.getUserPermissionOfArticle(userId, article.id);
      if (article.isPrivate && userRoles.count === 0 && userId !== article.userId) {
        throw new ForbiddenException('Access is forbidden');
      }
      return userRoles;
    }
    if (article.isPrivate) throw new ForbiddenException('Article is private');
    return null;
  }

  public async createArticle(article: CreateArticleDto, file: Express.Multer.File, userId: number): Promise<Article> {
    const fileId = v4();
    await this.firebaseRepo.uploadFile(fileId, file.buffer);
    return { content: article.content, isPrivate: article.isPrivate, thumbnail: fileId, title: article.title, userId };
  }
}
