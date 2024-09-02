import {
  Model,
  Column,
  Table,
  BelongsTo,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
} from 'sequelize-typescript';
import UserEntity from './user.entity';

@Table
export default class TokenEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  public id: number;

  @Column
  public value: string;

  @AllowNull(false)
  @ForeignKey(() => UserEntity)
  @Column
  public userId: number;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;
}
