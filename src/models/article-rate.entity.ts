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

@Table
export default class ArticleRateEntity extends Model {
  @AutoIncrement
  @AllowNull(false)
  @PrimaryKey
  @Column
  public articleRateId: number;

  @ForeignKey(() => ArticleEntity)
  @Column
  public articleId: number;

  @AllowNull(false)
  @Column
  public rate: 0 | 1;

  @BelongsTo(() => ArticleEntity)
  public article: ArticleEntity;

  @ForeignKey(() => UserEntity)
  @Column
  public userId: number;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;
}
