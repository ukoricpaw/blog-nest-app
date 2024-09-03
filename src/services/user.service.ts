import { BadRequestException, Injectable } from '@nestjs/common';
import CreateUserDto from 'src/dtos/create-user.dto';
import UserRepo from 'src/repositories/user/user.repository';
import { hash, compare } from 'bcrypt';
import UserDto from 'src/dtos/user.dto';
import { UserResponse } from 'src/types/user.response';

@Injectable()
export default class UserService {
  constructor(private userRepo: UserRepo) {}

  public async login(userDto: CreateUserDto) {
    const candidate = await this.checkExistingUser(userDto.email);
    if (!candidate) throw new BadRequestException("User doesn't exist in the system");
    const isRight = await compare(userDto.password, candidate.password);
    if (!isRight) throw new BadRequestException('Wrong password');
    return candidate;
  }

  public async checkExistingUser(email: string) {
    const candidate = await this.userRepo.findByEmail(email);
    return candidate;
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
