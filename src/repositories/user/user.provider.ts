import { USER_TOKENS } from 'src/constants/user.tokens';
import UserEntity from 'src/models/user.entity';

export const userProviders = [
  {
    provide: USER_TOKENS.REPO,
    useValue: UserEntity,
  },
];
