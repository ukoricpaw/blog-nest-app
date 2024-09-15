import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import FirebaseRepo from 'src/database/firebase.repository';
import Article from 'src/dtos/article.dto';
import CreateArticleDto, { PatchArticleDto } from 'src/dtos/create-article.dto';
import PermissionDto from 'src/dtos/permission.dto';
import ArticleAndAccessEntity from 'src/models/article-n-access.entity';
import ArticleEntity from 'src/models/article.entity';
import ArticleRepo from 'src/repositories/article/article.repository';
import { Request } from 'src/types/overwritten-request';
import { USER_ROLES } from 'src/types/user-roles';
import { PERMISSIONS } from 'src/utils/define-permissions';
import { v4 } from 'uuid';

@Injectable()
export default class ArticleService {
  constructor(
    private articleRepo: ArticleRepo,
    private firebaseRepo: FirebaseRepo,
  ) {}

  private async checkIsUserOwner(userId: number, articleId: number) {
    const userRole = await this.articleRepo.getUserPermissionOfArticle(userId, articleId);
    if (userRole?.permission?.name !== PERMISSIONS.OWNER) throw new ForbiddenException('forbidden');
  }

  public checkIsArticleExist(article: ArticleEntity | null) {
    if (!article) throw new BadRequestException("Article doesn't exist");
  }

  public checkArticleIsPrivate(article: ArticleEntity | null) {
    if (!article) throw new BadRequestException('Bad request');
    if (!article.isPrivate) throw new ForbiddenException('Forbidden');
  }

  public async checkRolesOfArticle(article: ArticleEntity, user: Request['user'] | undefined) {
    if (user) {
      let userRole = await this.articleRepo.getUserPermissionOfArticle(user.id, article.id);
      if (article.isPrivate && !userRole && user.roleId === USER_ROLES.USER)
        throw new ForbiddenException('Access is forbidden');
      if (user.roleId === USER_ROLES.MODERATOR) {
        userRole = { permission: { name: PERMISSIONS.OWNER } } as typeof userRole;
      }
      return userRole;
    }
    if (article.isPrivate) throw new ForbiddenException('Article is private');
    return null;
  }

  public async setPermissionToArticle(permissionDto: PermissionDto, articleId: number, userId: number) {
    await this.checkIsUserOwner(userId, articleId);
    const existedRole = await this.articleRepo.getUserPermissionOfArticle(permissionDto.userId, articleId);
    if (existedRole) {
      const permission = await this.articleRepo.getPermissionByName(permissionDto.permission);
      existedRole.permissionId = permission.id;
      await existedRole.save();
      return existedRole;
    }
    return await this.articleRepo.createRole(articleId, permissionDto.permission, userId);
  }

  public async deletePermissionFromArticle(articleId: number, userId: number, reqUserId: number) {
    await this.checkIsUserOwner(reqUserId, articleId);
    const existedRole = await this.articleRepo.getUserPermissionOfArticle(userId, articleId);
    if (!existedRole) throw new BadRequestException('Permission of corresponding user not found');
    await existedRole.destroy();
    return { message: 'User was removed' };
  }

  public async incrementQtyOfViews(article: ArticleEntity) {
    article.qtyOfViews += 1;
    await article.save();
  }

  public async modifyArticle(
    articleDto: PatchArticleDto,
    thumbnail: Buffer,
    article: ArticleEntity,
    role: ArticleAndAccessEntity,
  ) {
    if (!role || role.permission.name === PERMISSIONS.READ) throw new ForbiddenException('Forbidden');
    if (thumbnail) {
      const uuid = v4();
      this.firebaseRepo.deleteFile(article.thumbnail);
      this.firebaseRepo.uploadFile(uuid, thumbnail);
      article.thumbnail = uuid;
    }
    if (articleDto.content) article.content = articleDto.content;
    if (articleDto.title) article.title = articleDto.title;
    if (articleDto.isPrivate) article.isPrivate = articleDto.isPrivate;
    if (articleDto.tags) {
      const tags = articleDto.tags ? articleDto.tags.split(';').map(Number) : [];
      await this.articleRepo.deleteArticleTags(article.id);
      await this.articleRepo.createRelatedArticleTags(tags, article.id);
    }
    await article.save();
    return article;
  }

  public async createArticle(article: CreateArticleDto, file: Express.Multer.File, userId: number): Promise<Article> {
    const fileId = v4();
    await this.firebaseRepo.uploadFile(fileId, file.buffer);
    return { content: article.content, isPrivate: article.isPrivate, thumbnail: fileId, title: article.title, userId };
  }

  public async deleteArticle(id: number, userId: number, role: USER_ROLES) {
    const userRole = await this.articleRepo.getUserPermissionOfArticle(userId, id);
    if (userRole?.permission?.name !== PERMISSIONS.OWNER && role === USER_ROLES.USER)
      throw new ForbiddenException('Forbidden');
    const article = await this.articleRepo.deleteArticleById(id);
    this.firebaseRepo.deleteFile(article?.thumbnail);
    return article;
  }
}
