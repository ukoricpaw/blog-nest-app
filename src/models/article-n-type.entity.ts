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
import ArticleTypeEntity from './article-type.entity';

@Table
export default class ArticleAndTypeEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  public id: number;

  @ForeignKey(() => ArticleTypeEntity)
  @Column
  public articleTypeId: number;

  @BelongsTo(() => ArticleTypeEntity)
  public articleType: ArticleTypeEntity;

  @ForeignKey(() => ArticleEntity)
  @Column
  public articleId: number;

  @BelongsTo(() => ArticleEntity)
  public article: ArticleEntity;
}
