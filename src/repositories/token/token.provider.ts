import { TOKEN_TOKENS } from 'src/constants/token.tokens';
import TokenEntity from 'src/models/token.entity';

export const tokenProviders = [
  {
    provide: TOKEN_TOKENS.REPO,
    useValue: TokenEntity,
  },
];
