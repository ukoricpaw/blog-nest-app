import { ARTICLE_TOKENS } from 'src/constants/article.tokens';
import ArticleEntity from 'src/models/article.entity';

export const articleProviders = [
  {
    provide: ARTICLE_TOKENS.REPO,
    useValue: ArticleEntity,
  },
];
