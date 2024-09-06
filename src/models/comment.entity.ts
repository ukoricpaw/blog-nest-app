import {
  Table,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Column,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import ArticleEntity from './article.entity';
import UserEntity from './user.entity';

@Table
export default class CommentEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  public id: number;

  @ForeignKey(() => ArticleEntity)
  @Column
  public articleId: number;

  @BelongsTo(() => ArticleEntity)
  public article: ArticleEntity;

  @ForeignKey(() => UserEntity)
  @Column
  public userId: number;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;
}
