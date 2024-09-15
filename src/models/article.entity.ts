import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import UserEntity from './user.entity';
import ArticleRateEntity from './article-rate.entity';
import ArticleAndAccessEntity from './article-n-access.entity';
import { DataTypes } from 'sequelize';
import ArticleAndTypeEntity from './article-n-type.entity';

@Table
export default class ArticleEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  public id: number;

  @Column
  public thumbnail: string;

  @AllowNull(false)
  @Column
  public title: string;

  @AllowNull(false)
  @Column(DataTypes.TEXT)
  public content: string;

  @ForeignKey(() => UserEntity)
  @Column
  public userId: number;

  @AllowNull(false)
  @Column
  public isPrivate: boolean;

  @Column
  public qtyOfViews: number;

  @Column
  public inviteLink: string;

  @Column
  public articleActiveType: number;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;

  @HasMany(() => ArticleAndAccessEntity)
  public articleAndAccess: ArticleAndAccessEntity[];

  @HasMany(() => ArticleRateEntity)
  public articleRates: ArticleRateEntity[];

  @HasMany(() => ArticleAndTypeEntity)
  public articleTypes: ArticleAndTypeEntity[];
}
