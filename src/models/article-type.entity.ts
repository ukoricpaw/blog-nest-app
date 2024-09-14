import { AllowNull, AutoIncrement, Column, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import ArticleAndTypeEntity from './article-n-type.entity';

@Table
export default class ArticleTypeEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  public id: number;

  @AllowNull(false)
  @Column
  public name: string;

  @HasMany(() => ArticleAndTypeEntity)
  public articleAndTypes: ArticleAndTypeEntity[];
}
