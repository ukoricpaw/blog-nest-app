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
import { DataTypes } from 'sequelize';

@Table
export default class TokenEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  public id: number;

  @Column(DataTypes.TEXT)
  public value: string;

  @AllowNull(false)
  @ForeignKey(() => UserEntity)
  @Column
  public userId: number;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;
}
