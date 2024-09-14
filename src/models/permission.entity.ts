import { AllowNull, AutoIncrement, Column, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript';
import ArticleAndAccessEntity from './article-n-access.entity';

@Table
export default class PermissionEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  public id: number;

  @AllowNull(false)
  @Column
  public name: string;
  @HasMany(() => ArticleAndAccessEntity)
  public articleAndAccess: ArticleAndAccessEntity[];
}
