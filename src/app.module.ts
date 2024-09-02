import { Module } from '@nestjs/common';
import DatabaseModule from './database/database.provider';
import { ConfigModule } from '@nestjs/config';
import UserModule from './modules/user.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
  ],
})
export class AppModule {}
