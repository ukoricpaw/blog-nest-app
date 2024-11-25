import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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
import { PERMISSIONS } from 'src/utils/define-permissions';
import { v4 } from 'uuid';
import UserEntity from '../../models/user.entity';
import CommentRateEntity from '../../models/comment-rate.entity';
import { USER_TOKENS } from '../../constants/user.tokens';
import { ModerateArticleDto } from '../../dtos/moderate-article.dto';

@Injectable()
export default class ArticleRepo {
  constructor(
    @Inject(ARTICLE_TOKENS.REPO) private article: typeof ArticleEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_N_ACCESS_REPO) private access: typeof ArticleAndAccessEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_N_TYPE_REPO) private article_n_tags: typeof ArticleAndTypeEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_PERMISSION_REPO) private permission: typeof PermissionEntity,
    @Inject(ARTICLE_TOKENS.COMMENT_REPO) private comment: typeof CommentEntity,
    @Inject(ARTICLE_TOKENS.COMMENT_RATE_REPO) private commentRate: typeof CommentRateEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_TYPE_REPO) private article_tags: typeof ArticleTypeEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_RATE_REPO) private article_rate: typeof ArticleRateEntity,
    @Inject(USER_TOKENS.REPO) private user: typeof UserEntity,
  ) {}

  public async getArticleRate(articleId: number, userId: number) {
    const article = await this.article.findOne({
      where: { id: articleId },
      include: [
        {
          model: this.article_rate,
          as: 'articleRates',
          required: false,
          where: {
            userId: userId ?? null,
          },
        },
      ],
    });
    if (!article) throw new BadRequestException("Article doesn't exist");
    return {
      dislikes: article.dislikes,
      likes: article.likes,
      articleRate: article.articleRates,
    };
  }

  public async moderateArticle(articleId: number, moderateArticleDto: ModerateArticleDto) {
    const article = await this.article.findOne({ where: { id: articleId } });
    if (!article) throw new BadRequestException('Article not found');
    article.articleActiveType = moderateArticleDto.action === 'CONFIRMED' ? ActiveTypes.ACTIVE : ActiveTypes.BANNED;
    await article.save();
    return { message: 'OK' };
  }

  public async getArticlesForModeration(
    search: string,
    tags: number[],
    offset: number,
    limit: number,
    isPrivate?: boolean,
    sort: 'DESC' | 'ASC' = 'DESC',
  ) {
    const articlesQuery: FindAndCountOptions<Attributes<any>> = {
      where: {
        ...this.getSearchByCapitalize(search, 'title'),
        articleActiveType: ActiveTypes.MODERATION,
        isPrivate: isPrivate ?? [true, false],
      },
      order: [['createdAt', sort]],
      attributes: {
        exclude: ['content'],
      },
      include: [
        this.getTagsOfArticleByRelations(tags),
        {
          model: this.user,
          as: 'user',
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt', 'roleId'],
          },
        },
      ],
      distinct: true,
      offset,
      limit,
    };

    return this.article.findAndCountAll(articlesQuery);
  }

  public async updateCommentRate(rate: RateRequest, commentId: number, userId: number) {
    const commentRate = await this.commentRate.findOne({ where: { commentId, userId } });
    if (!commentRate && rate.action !== 'DELETE') {
      return this.commentRate.create({ commentId, userId, rate: rate.rate });
    }

    if (rate.action === 'DELETE') {
      if (commentRate) {
        await commentRate.destroy();
      }
      return { message: 'deleted' };
    }

    commentRate.rate = rate.rate;
    await commentRate.save();
    return commentRate;
  }

  public async checkPermissionOfUser(userId: number, articleId: number) {
    return this.access.findOne({
      where: { userId, articleId },
      include: [{ model: this.permission, as: 'permission' }],
    });
  }

  public async getCommentById(commentId: number) {
    return this.comment.findOne({ where: { id: commentId } });
  }

  public async getComments(offset: number, count: number, articleId: number, userId?: number) {
    return this.comment.findAndCountAll({
      where: { articleId },
      offset,
      limit: count,
      include: [
        {
          model: this.user,
          as: 'user',
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt'],
          },
        },
        {
          model: this.commentRate,
          as: 'commentRate',
          required: false,
          where: {
            userId: userId ?? null,
          },
          attributes: {
            exclude: ['updatedAt', 'createdAt'],
          },
        },
      ],
    });
  }

  public async createComment(articleId: number, userId: number, content: string) {
    return this.comment.create({ articleId, userId, content });
  }

  public async getPermissionByName(permissionName: PERMISSIONS) {
    return this.permission.findOne({ where: { name: permissionName } });
  }

  public async createRole(articleId: number, permissionName: PERMISSIONS, userId: number) {
    const permission = await this.getPermissionByName(permissionName);
    await this.access.create({ articleId, permissionId: permission.id, userId });
  }

  public async getArticlesBySearch(search: string, toModerate?: boolean) {
    if (!search)
      return {
        count: 0,
        rows: [],
      };
    return this.article.findAndCountAll({
      where: {
        title: { [Op.like]: `%${search}%` },
        articleActiveType: toModerate ? ActiveTypes.MODERATION : ActiveTypes.ACTIVE,
      },
      attributes: {
        exclude: [
          'articleActiveType',
          'createdAt',
          'updatedAt',
          'isPrivate',
          'userId',
          'content',
          'thumbnail',
          'inviteLink',
          'qtyOfViews',
        ],
      },
    });
  }

  public async deleteArticleTags(articleId: number) {
    return this.article_n_tags.destroy({ where: { articleId } });
  }

  public async addOrChangeRateToArticle(rate: RateRequest, articleId: number, userId: number) {
    const [articleRate, article] = await Promise.all([
      this.article_rate.findOne({ where: { userId, articleId } }),
      this.article.findOne({ where: { id: articleId } }),
    ]);

    if (rate.action === 'ADD' && articleRate?.rate !== rate.rate) {
      if (!articleRate) {
        if (rate.rate === 0) {
          article.dislikes += 1;
        } else {
          article.likes += 1;
        }
        await this.article_rate.create({ userId, articleId, rate: rate.rate });
      } else if (articleRate) {
        if (rate.rate === 0) {
          article.dislikes += 1;
          article.likes -= 1;
        } else {
          article.dislikes -= 1;
          article.likes += 1;
        }
        articleRate.rate = rate.rate;
        await articleRate.save();
      }
    } else if (articleRate && rate.action === 'DELETE' && articleRate?.rate === rate.rate) {
      if (rate.rate === 0) {
        article.dislikes -= 1;
      } else {
        article.likes -= 1;
      }
      await articleRate.destroy();
    }
    await article.save();
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
      include: [
        this.getTagsOfArticleByRelations(),
        {
          model: UserEntity,
          as: 'user',
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt', 'roleId'],
          },
        },
      ],
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
      status?: string;
    },
    sort: 'DESC' | 'ASC' = 'DESC',
  ) {
    const articlesQuery: FindAndCountOptions<Attributes<any>> = {
      where: {
        ...this.getSearchByCapitalize(search, 'title'),
        articleActiveType: ActiveTypes.ACTIVE,
        isPrivate: false,
      },
      order: [['createdAt', sort]],
      include: [this.getTagsOfArticleByRelations(tags)],
      distinct: true,
      offset,
      limit,
    };

    if (userOptions.forUser) {
      if (userOptions.user.id && userOptions.user?.roleId !== undefined) {
        articlesQuery.where = {
          ...articlesQuery.where,
          articleActiveType: {
            [Op.in]:
              userOptions.status !== undefined
                ? [Number(userOptions.status)]
                : [ActiveTypes.ACTIVE, ActiveTypes.BANNED, ActiveTypes.MODERATION],
          },
          isPrivate: {
            [Op.in]: userOptions.isPrivate === undefined ? [true, false] : [userOptions.isPrivate],
          },
        };
      } else {
        articlesQuery.where = {
          ...articlesQuery.where,
          isPrivate: false,
        };
      }

      articlesQuery.where = {
        ...articlesQuery.where,
        userId: userOptions.user.id,
      };
      (articlesQuery.include as Includeable[]).push(this.getAccessOfArticle(userOptions.user.id, true));
    }

    const articles = await this.article.findAndCountAll(articlesQuery);

    const articlesWithFullInfo = await Promise.all(
      articles.rows.map(a =>
        this.article.findOne({
          where: { id: a.id },
          attributes: { exclude: ['inviteLink', 'content'] },
          include: [
            this.getTagsOfArticleByRelations(),
            this.getAccessOfArticle(userOptions.user?.id),
            {
              model: UserEntity,
              as: 'user',
              attributes: {
                exclude: ['password', 'createdAt', 'updatedAt', 'roleId'],
              },
            },
          ],
        }),
      ),
    );
    return { count: articles.count, rows: articlesWithFullInfo };
  }

  public async createArticle(article: Article) {
    const inviteLink = v4();
    return this.article.create({
      ...article,
      qtyOfViews: 0,
      dislikes: 0,
      likes: 0,
      articleActiveType: ActiveTypes.MODERATION,
      inviteLink,
    });
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
