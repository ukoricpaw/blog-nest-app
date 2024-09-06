import { Inject, Injectable } from '@nestjs/common';
import { ARTICLE_TOKENS } from 'src/constants/article.tokens';
import ArticleEntity from 'src/models/article.entity';

@Injectable()
export default class ArticleRepo {
  constructor(@Inject(ARTICLE_TOKENS.REPO) private article: typeof ArticleEntity) {
    console.log(article);
  }
}
