import { Sequelize } from 'sequelize-typescript';
import ArticleAndAccess from 'src/models/article-n-access.entity';
import ArticleAndTypeEntity from 'src/models/article-n-type.entity';
import ArticleTypeEntity from 'src/models/article-type.entity';
import ArticleEntity from 'src/models/article.entity';
import CommentEntity from 'src/models/comment.entity';
import PermissionEntity from 'src/models/permission.entity';
import RoleEntity from 'src/models/role.entity';
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

      sequelize.addModels([
        TokenEntity,
        UserEntity,
        RoleEntity,
        ArticleEntity,
        CommentEntity,
        ArticleTypeEntity,
        PermissionEntity,
        ArticleAndAccess,
        ArticleAndTypeEntity,
      ]);

      await sequelize.sync();
      return sequelize;
    },
  },
];
