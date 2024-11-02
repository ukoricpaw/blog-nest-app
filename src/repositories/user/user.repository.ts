import { Inject, Injectable } from '@nestjs/common';
import { TOKEN_TOKENS } from 'src/constants/token.tokens';
import { USER_TOKENS } from 'src/constants/user.tokens';
import CreateUserDto from 'src/dtos/create-user.dto';
import TokenEntity from 'src/models/token.entity';
import UserEntity from 'src/models/user.entity';
import { USER_ROLES } from 'src/types/user-roles';

@Injectable()
export default class UserRepo {
  constructor(
    @Inject(TOKEN_TOKENS.REPO) private token: typeof TokenEntity,
    @Inject(USER_TOKENS.REPO) private user: typeof UserEntity,
  ) {}

  async findByEmail(email: string): Promise<UserEntity> {
    return this.user.findOne<UserEntity>({ where: { email } });
  }

  async findById(id: number) {
    return this.user.findOne<UserEntity>({ where: { id } });
  }

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    return this.user.create({ email: dto.email, password: dto.password, avatarUrl: null, roleId: USER_ROLES.USER });
  }
}
