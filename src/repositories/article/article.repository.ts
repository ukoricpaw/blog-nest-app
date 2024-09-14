import { Inject, Injectable } from '@nestjs/common';
import { Attributes, FindAndCountOptions, Op } from 'sequelize';
import { ARTICLE_TOKENS } from 'src/constants/article.tokens';
import Article from 'src/dtos/article.dto';
import ArticleAndAccessEntity from 'src/models/article-n-access.entity';
import ArticleAndTypeEntity from 'src/models/article-n-type.entity';
import ArticleTypeEntity from 'src/models/article-type.entity';
import ArticleEntity from 'src/models/article.entity';
import CommentEntity from 'src/models/comment.entity';
import PermissionEntity from 'src/models/permission.entity';
import { ActiveTypes } from 'src/types/active-types';

@Injectable()
export default class ArticleRepo {
  constructor(
    @Inject(ARTICLE_TOKENS.REPO) private article: typeof ArticleEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_N_ACCESS_REPO) private access: typeof ArticleAndAccessEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_N_TYPE_REPO) private article_n_tags: typeof ArticleAndTypeEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_PERMISSION_REPO) private permission: typeof PermissionEntity,
    @Inject(ARTICLE_TOKENS.COMMENT_REPO) private comment: typeof CommentEntity,
    @Inject(ARTICLE_TOKENS.ARTICLE_TYPE_REPO) private article_tags: typeof ArticleTypeEntity,
  ) {}

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

  public async getArticleById(id: number) {
    return this.article.findOne({
      where: { id },
      include: [this.getTagsOfArticleByRelations()],
    });
  }

  public async getArticles(search: string, tags: number[], offset: number, limit: number) {
    const articles = await this.article.findAndCountAll({
      where: { ...this.getSearchByCapitalize(search, 'title'), isPrivate: false },
      include: [this.getTagsOfArticleByRelations(tags)],
      distinct: true,
      offset,
      limit,
    });

    const articlesWithFullInfo = await Promise.all(
      articles.rows.map(a =>
        this.article.findOne({ where: { id: a.id }, include: [this.getTagsOfArticleByRelations()] }),
      ),
    );
    return { count: articles.count, rows: articlesWithFullInfo };
  }

  public async createArticle(article: Article) {
    return this.article.create({ ...article, qtyOfViews: 0, articleActiveType: ActiveTypes.MODERATION });
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
    return this.access.findAndCountAll({
      where: { articleId, userId },
      attributes: {
        exclude: ['articleId', 'userId'],
      },
      include: [
        {
          model: PermissionEntity,
          as: 'permission',
        },
      ],
    });
  }
}
