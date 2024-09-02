import { Table, Column, HasOne, Model, PrimaryKey, AutoIncrement, AllowNull, Unique } from 'sequelize-typescript';
import TokenEntity from './token.entity';
import { DataTypes } from 'sequelize';

@Table
export default class UserEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column(DataTypes.INTEGER)
  public id: number;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  public email: string;

  @AllowNull(false)
  @Column(DataTypes.STRING)
  public password: string;

  @HasOne(() => TokenEntity)
  public token: TokenEntity;
}
