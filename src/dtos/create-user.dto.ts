import { IsEmail, Length } from 'class-validator';

export default class CreateUserDto {
  @Length(8, 24)
  password: string;

  @IsEmail()
  email: string;
}
