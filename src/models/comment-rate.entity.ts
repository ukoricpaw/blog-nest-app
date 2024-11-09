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
import CommentEntity from './comment.entity';
import UserEntity from './user.entity';

@Table
export default class CommentRateEntity extends Model {
  @AutoIncrement
  @AllowNull(false)
  @PrimaryKey
  @Column
  public id: number;

  @AllowNull(false)
  @Column
  public rate: 0 | 1;

  @ForeignKey(() => CommentEntity)
  @Column
  public commentId: number;

  @ForeignKey(() => UserEntity)
  @Column
  public userId: number;

  @BelongsTo(() => CommentEntity)
  public comment: CommentEntity;

  @BelongsTo(() => UserEntity)
  public user: UserEntity;
}
