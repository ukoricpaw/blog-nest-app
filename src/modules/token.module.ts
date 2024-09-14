import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import DatabaseModule from 'src/database/database.module';
import TokenRepo from 'src/repositories/token/token.repository';
import TokenService from 'src/services/token.service';

@Module({
  providers: [TokenService, TokenRepo],
  exports: [TokenService, TokenRepo],
  imports: [
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_KEY,
      signOptions: { expiresIn: '15m' },
    }),
  ],
})
export default class TokenModule {}
