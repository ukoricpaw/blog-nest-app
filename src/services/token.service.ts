import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TOKEN_TOKENS } from 'src/constants/token.tokens';
import { USER_TOKENS } from 'src/constants/user.tokens';
import UserDto from 'src/dtos/user.dto';
import TokenEntity from 'src/models/token.entity';
import UserEntity from 'src/models/user.entity';
import TokenRepo from 'src/repositories/token/token.repository';

@Injectable()
export default class TokenService {
  constructor(
    private jwtService: JwtService,
    @Inject(USER_TOKENS.REPO) private user: typeof UserEntity,
    @Inject(TOKEN_TOKENS.REPO) private token: typeof TokenEntity,
    private tokenRepo: TokenRepo,
  ) {}

  public createAccessToken(data: UserDto) {
    return this.jwtService.sign(data.toJSON(), { secret: process.env.ACCESS_KEY, expiresIn: '15m' });
  }

  public createRefreshToken(data: UserDto) {
    return this.jwtService.sign(data.toJSON(), { secret: process.env.REFRESH_KEY, expiresIn: '1h' });
  }

  public async createOrChangeToken(tokenName: string, userId: number) {
    const token = await this.token.findOne({ where: { userId } });
    if (token) {
      token.value = tokenName;
      await token.save();
    } else {
      await this.tokenRepo.createToken(userId, tokenName);
    }
  }
}
