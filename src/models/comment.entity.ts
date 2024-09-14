import {
  Table,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Column,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import ArticleEntity from './article.entity';
import UserEntity from './user.entity';
import CommentRateEntity from './comment-rate.entity';

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

  @HasMany(() => CommentRateEntity)
  public CommentRateEntitys: CommentRateEntity[];
}
