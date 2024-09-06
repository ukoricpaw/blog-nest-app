import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import ArticleEntity from './article.entity';
import UserEntity from './user.entity';
import PermissionEntity from './permission.entity';

@Table
export default class ArticleAndAccess extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  public id: number;

  @ForeignKey(() => UserEntity)
  @Column
  public userId: number;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;

  @ForeignKey(() => ArticleEntity)
  @Column
  public articleId: number;

  @BelongsTo(() => ArticleEntity)
  public article: ArticleEntity;

  @ForeignKey(() => PermissionEntity)
  @Column
  public permissionId: number;

  @BelongsTo(() => PermissionEntity)
  public permission: PermissionEntity;
}
