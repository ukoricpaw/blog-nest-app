import { Table, Column, HasOne, Model, PrimaryKey, AutoIncrement, AllowNull } from 'sequelize-typescript';
import TokenEntity from './token.entity';

@Table
export default class UserEntity extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  public id: string;

  @AllowNull(false)
  @Column
  public email: string;

  @AllowNull(false)
  @Column
  public password: string;

  @HasOne(() => TokenEntity)
  public token: TokenEntity;
}
