import { Inject, Injectable } from '@nestjs/common';
import { Attributes, FindAndCountOptions, Includeable, Op } from 'sequelize';
import { ARTICLE_TOKENS } from 'src/constants/article.tokens';
import Article from 'src/dtos/article.dto';
import ArticleAndAccessEntity from 'src/models/article-n-access.entity';
import ArticleAndTypeEntity from 'src/models/article-n-type.entity';
import ArticleRateEntity from 'src/models/article-rate.entity';
import ArticleTypeEntity from 'src/models/article-type.entity';
import ArticleEntity from 'src/models/article.entity';
import CommentEntity from 'src/models/comment.entity';
import PermissionEntity from 'src/models/permission.entity';
import { ActiveTypes } from 'src/types/active-types';
import { Request } from 'src/types/overwritten-request';
import { RateRequest } from 'src/types/rate-request';
import { USER_ROLES } from 'src/types/user-roles';
import { PERMISSIONS } from 'src/utils/define-permissions';
import { v4 } from 'uuid';

@Injectable()
export default class ArticleRepo {
  constructor(
    @Inject(ARTICLE_TOKENS.REPO) private article: typeof ArticleEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_N_ACCESS_REPO) private access: typeof ArticleAndAccessEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_N_TYPE_REPO) private article_n_tags: typeof ArticleAndTypeEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_PERMISSION_REPO) private permission: typeof PermissionEntity,
    @Inject(ARTICLE_TOKENS.COMMENT_REPO) private comment: typeof CommentEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_TYPE_REPO) private article_tags: typeof ArticleTypeEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_RATE_REPO) private article_rate: typeof ArticleRateEntity,
  ) {}

  public async getPermissionByName(permissionName: PERMISSIONS) {
    return this.permission.findOne({ where: { name: permissionName } });
  }

  public async createRole(articleId: number, permissionName: PERMISSIONS, userId: number) {
    const permission = await this.getPermissionByName(permissionName);
    await this.access.create({ articleId, permissionId: permission.id, userId });
  }

  public async deleteArticleTags(articleId: number) {
    return this.article_n_tags.destroy({ where: { articleId } });
  }

  public async addOrChangeRateToArticle(rate: RateRequest, articleId: number, userId: number) {
    const articleRate = await this.article_rate.findOne({ where: { userId, articleId } });
    if (rate.action === 'ADD') {
      if (!articleRate) {
        await this.article_rate.create({ userId, articleId, rate: rate.rate });
      } else if (articleRate && articleRate.rate !== rate.rate) {
        articleRate.rate = rate.rate;
        await articleRate.save();
      }
    } else if (articleRate && rate.action === 'DELETE') {
      await articleRate.destroy();
    }
    return {
      action: rate.action,
      rate: rate.rate,
    };
  }

  private getAccessOfArticle(userId?: number, isRequired?: boolean) {
    return {
      model: ArticleAndAccessEntity,
      as: 'articleAndAccess',
      required: isRequired || false,
      where: {
        userId: {
          [Op.in]: userId ? [userId] : [],
        },
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    };
  }

  private getSearchByCapitalize(search: string, key: string) {
    return {
      [Op.or]: [
        {
          [key]: {
            [Op.like]: `%${search.toLowerCase()}%`,
          },
        },
        {
          [key]: {
            [Op.like]: `%${search}%`,
          },
        },
      ],
    };
  }

  private getTagsOfArticleByRelations(tags?: number[]) {
    const result: Omit<FindAndCountOptions<Attributes<any>>, 'group'>['include'] = {
      model: ArticleAndTypeEntity,
      as: 'articleTypes',
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      include: [
        {
          model: ArticleTypeEntity,
          as: 'articleType',
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
        },
      ],
    };

    if (tags?.length) {
      result.where = {
        articleTypeId: {
          [Op.in]: tags,
        },
      };
    }

    return result;
  }

  public async deleteArticleById(id: number) {
    const article = await this.article.findOne({ where: { id } });
    await article?.destroy();
    return article;
  }

  public async getArticleById(id: number) {
    return this.article.findOne({
      where: { id },
      include: [this.getTagsOfArticleByRelations()],
    });
  }

  public async getArticleByLink(link: string) {
    return this.article.findOne({ where: { inviteLink: link } });
  }

  public async getArticles(
    search: string,
    tags: number[],
    offset: number,
    limit: number,
    userOptions: {
      user: Request['user'] | undefined;
      isPrivate?: boolean;
      forUser?: boolean;
    },
  ) {
    const isUserOptionsWithPrivateProperty = userOptions.forUser && userOptions.isPrivate !== undefined;
    const articlesQuery: FindAndCountOptions<Attributes<any>> = {
      where: {
        ...this.getSearchByCapitalize(search, 'title'),
        isPrivate: {
          [Op.in]:
            !isUserOptionsWithPrivateProperty || userOptions.user?.roleId === USER_ROLES.MODERATOR
              ? [true, false]
              : [isUserOptionsWithPrivateProperty ? userOptions.isPrivate : false],
        },
      },
      attributes: { exclude: ['inviteLink'] },
      include: [this.getTagsOfArticleByRelations(tags)],
      distinct: true,
      offset,
      limit,
    };

    if (userOptions.forUser) {
      articlesQuery.where = {
        [Op.or]: [{ ...articlesQuery.where }, { ...articlesQuery.where, userId: userOptions.user.id }],
      };
      articlesQuery.where = {
        ...articlesQuery.where,
        isPrivate: userOptions.isPrivate === undefined ? { [Op.in]: [true, false] } : userOptions.isPrivate,
      };
      (articlesQuery.include as Includeable[]).push(this.getAccessOfArticle(userOptions.user.id, true));
      console.log(articlesQuery);
    }

    const articles = await this.article.findAndCountAll(articlesQuery);

    const articlesWithFullInfo = await Promise.all(
      articles.rows.map(a =>
        this.article.findOne({
          where: { id: a.id },
          include: [this.getTagsOfArticleByRelations(), this.getAccessOfArticle(userOptions.user?.id)],
        }),
      ),
    );
    return { count: articles.count, rows: articlesWithFullInfo };
  }

  public async createArticle(article: Article) {
    const inviteLink = v4();
    return this.article.create({ ...article, qtyOfViews: 0, articleActiveType: ActiveTypes.MODERATION, inviteLink });
  }

  public async createRelatedArticleTags(tags: number[], articleId: number) {
    await Promise.all(tags.map(tag => ArticleAndTypeEntity.create({ articleTypeId: tag, articleId })));
  }

  public async getArticleTags(search: string) {
    return this.article_tags.findAndCountAll({
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      where: this.getSearchByCapitalize(search, 'name'),
    });
  }

  public async getUserPermissionOfArticle(userId: number, articleId: number) {
    return this.access.findOne({
      where: { articleId, userId },
      attributes: {
        exclude: ['articleId', 'userId', 'createdAt', 'updatedAt'],
      },
      include: [
        {
          model: PermissionEntity,
          as: 'permission',
          attributes: { exclude: ['createdAt', 'updatedAt'] },
        },
      ],
    });
  }
}
