import UserDto from 'src/dtos/user.dto';

export interface UserResponse extends Omit<UserDto, 'toJSON'> {
  access: string;
  refresh: string;
}
