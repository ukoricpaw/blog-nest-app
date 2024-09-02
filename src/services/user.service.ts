import { BadRequestException, Injectable } from '@nestjs/common';
import CreateUserDto from 'src/dtos/create-user.dto';
import UserRepo from 'src/repositories/user/user.repository';
import { hash } from 'bcrypt';
import UserDto from 'src/dtos/user.dto';
import { UserResponse } from 'src/types/user.response';

@Injectable()
export default class UserService {
  constructor(private userRepo: UserRepo) {}

  public async login(userDto: CreateUserDto) {}

  public async checkExistingUser(email: string) {
    const candidate = await this.userRepo.findByEmail(email);
    return candidate ? true : false;
  }

  public transformToResponse(userDto: UserDto, tokens: { access: string; refresh: string }): UserResponse {
    return { ...userDto.toJSON(), ...tokens };
  }

  public async registration(userDto: CreateUserDto) {
    const isExist = await this.checkExistingUser(userDto.email);
    if (isExist) throw new BadRequestException('User already exists');
    const hashPassword = await hash(userDto.password, 5);
    return this.userRepo.createUser({ ...userDto, password: hashPassword });
  }
}
