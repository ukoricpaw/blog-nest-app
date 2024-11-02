import UserEntity from 'src/models/user.entity';

export default class UserDto {
  public email: string;
  public id: number;
  public roleId: number;
  public avatarUrl: string | null;
  constructor(user: UserEntity) {
    this.email = user.email;
    this.id = user.id;
    this.roleId = user.roleId;
    this.avatarUrl = user.avatarUrl;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      roleId: this.roleId,
      avatarUrl: this.avatarUrl,
    };
  }
}
