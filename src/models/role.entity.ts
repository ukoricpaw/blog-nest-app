import { AllowNull, AutoIncrement, Column, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table
export default class RoleEntity extends Model {
  @PrimaryKey
  @AutoIncrement
  @AllowNull(false)
  @Column
  public id: number;

  @AllowNull(false)
  @Column
  public name: string;
}
