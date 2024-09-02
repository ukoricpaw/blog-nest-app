import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/jwt.constants';
import DatabaseModule from 'src/database/database.provider';
import TokenRepo from 'src/repositories/token/token.repository';
import TokenService from 'src/services/token.service';

@Module({
  providers: [TokenService, TokenRepo],
  exports: [TokenService, TokenRepo],
  imports: [
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.access_key,
      signOptions: { expiresIn: '15m' },
    }),
  ],
})
export default class TokenModule {}
