import {
  Model,
  Column,
  Table,
  BelongsTo,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
} from 'sequelize-typescript';
import UserEntity from './user.entity';

@Table
export default class TokenEntity extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  public id: string;

  @AllowNull(false)
  @ForeignKey(() => UserEntity)
  @Column
  public userId: string;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;
}
