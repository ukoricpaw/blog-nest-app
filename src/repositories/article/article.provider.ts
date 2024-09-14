import { ARTICLE_TOKENS } from 'src/constants/article.tokens';
import ArticleAndAccessEntity from 'src/models/article-n-access.entity';
import ArticleAndTypeEntity from 'src/models/article-n-type.entity';
import ArticleRateEntity from 'src/models/article-rate.entity';
import ArticleTypeEntity from 'src/models/article-type.entity';
import ArticleEntity from 'src/models/article.entity';
import CommentRateEntity from 'src/models/comment-rate.entity';
import CommentEntity from 'src/models/comment.entity';
import PermissionEntity from 'src/models/permission.entity';

export const articleProviders = [
  {
    provide: ARTICLE_TOKENS.REPO,
    useValue: ArticleEntity,
  },
  {
    provide: ARTICLE_TOKENS.ARTICLE_N_ACCESS_REPO,
    useValue: ArticleAndAccessEntity,
  },
  {
    provide: ARTICLE_TOKENS.ARTICLE_N_TYPE_REPO,
    useValue: ArticleAndTypeEntity,
  },
  {
    provide: ARTICLE_TOKENS.ARTICLE_TYPE_REPO,
    useValue: ArticleTypeEntity,
  },
  {
    provide: ARTICLE_TOKENS.ARTICLE_RATE_REPO,
    useValue: ArticleRateEntity,
  },
  {
    provide: ARTICLE_TOKENS.COMMENT_RATE_REPO,
    useValue: CommentRateEntity,
  },
  {
    provide: ARTICLE_TOKENS.COMMENT_REPO,
    useValue: CommentEntity,
  },
  {
    provide: ARTICLE_TOKENS.ARTICLE_PERMISSION_REPO,
    useValue: PermissionEntity,
  },
];
