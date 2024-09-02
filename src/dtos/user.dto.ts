import UserEntity from 'src/models/user.entity';

export default class UserDto {
  public email: string;
  public id: number;
  constructor(user: UserEntity) {
    this.email = user.email;
    this.id = user.id;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
    };
  }
}
