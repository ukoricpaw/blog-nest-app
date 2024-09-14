import UserEntity from 'src/models/user.entity';

export default class UserDto {
  public email: string;
  public id: number;
  public roleId: number;
  constructor(user: UserEntity) {
    this.email = user.email;
    this.id = user.id;
    this.roleId = user.roleId;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      roleId: this.roleId,
    };
  }
}
