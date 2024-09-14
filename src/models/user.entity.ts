import {
  Table,
  Column,
  HasOne,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  HasMany,
} from 'sequelize-typescript';
import TokenEntity from './token.entity';
import { DataTypes } from 'sequelize';
import ArticleEntity from './article.entity';
import ArticleRateEntity from './article-rate.entity';
import CommentRateEntity from './comment-rate.entity';

@Table
export default class UserEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column(DataTypes.INTEGER)
  public id: number;

  @Column
  public avatarUrl: string;

  @Column
  public roleId: number;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  public email: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  public password: string;

  @HasOne(() => TokenEntity)
  public token: TokenEntity;

  @HasMany(() => ArticleEntity)
  public articles: ArticleEntity[];

  @HasMany(() => ArticleRateEntity)
  public articleRates: ArticleRateEntity[];

  @HasMany(() => CommentRateEntity)
  public CommentRateEntitys: CommentRateEntity[];
}
