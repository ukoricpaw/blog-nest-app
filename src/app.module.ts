import { Module } from '@nestjs/common';
import DatabaseModule from './database/database.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
  ],
})
export class AppModule {}
