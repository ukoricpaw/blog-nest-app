import { Inject, Injectable } from '@nestjs/common';
import { TOKEN_TOKENS } from 'src/constants/token.tokens';
import { USER_TOKENS } from 'src/constants/user.tokens';
import TokenEntity from 'src/models/token.entity';
import UserEntity from 'src/models/user.entity';

@Injectable()
export default class TokenRepo {
  constructor(
    @Inject(TOKEN_TOKENS.REPO) private token: typeof TokenEntity,
    @Inject(USER_TOKENS.REPO) private user: typeof UserEntity,
  ) {}
  createToken(userId: number, tokenName: string) {
    return this.token.create({ value: tokenName, userId });
  }
}
