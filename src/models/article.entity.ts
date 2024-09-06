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
import UserEntity from './user.entity';

@Table
export default class ArticleEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  public id: number;

  @AllowNull(false)
  @Column
  public title: string;

  @AllowNull(false)
  @Column
  public content: string;

  @ForeignKey(() => UserEntity)
  @Column
  public userId: number;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;
}
