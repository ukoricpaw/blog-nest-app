import { Sequelize } from 'sequelize-typescript';
import TokenEntity from 'src/models/token.entity';
import UserEntity from 'src/models/user.entity';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        port: Number(process.env.DATABASE_PORT),
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
      });

      sequelize.addModels([TokenEntity, UserEntity]);

      await sequelize.sync();
      return sequelize;
    },
  },
];
