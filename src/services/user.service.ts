import { BadRequestException, Injectable } from '@nestjs/common';
import CreateUserDto from 'src/dtos/create-user.dto';
import UserRepo from 'src/repositories/user/user.repository';
import { hash, compare } from 'bcrypt';
import UserDto from 'src/dtos/user.dto';
import { UserResponse } from 'src/types/user.response';
import FirebaseRepo from '../database/firebase.repository';
import { v4 } from 'uuid';

@Injectable()
export default class UserService {
  constructor(
    private userRepo: UserRepo,
    private firebaseRepo: FirebaseRepo,
  ) {}

  public async getUserById(id: string) {
    const user = await this.userRepo.findById(Number(id));
    if (!user) throw new BadRequestException("User doesn't exist");
    const dto = new UserDto(user);
    return dto.toJSON();
  }

  public async changeUserAvatar(email: string, avatar: Express.Multer.File, toDelete?: boolean) {
    if (!toDelete && !avatar) throw new BadRequestException('File is not passed');
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new BadRequestException("User doesn't exist in system");
    if (toDelete) {
      if (!user.avatarUrl) throw new BadRequestException("Avatar doesn't exist");
      this.firebaseRepo.deleteFile(user.avatarUrl);
      user.avatarUrl = null;
      await user.save();
      return 'Avatar was deleted';
    }
    const uuid = v4();
    if (!user.avatarUrl) {
      await this.firebaseRepo.uploadFile(uuid, avatar.buffer);
    } else {
      await Promise.all([
        this.firebaseRepo.deleteFile(user.avatarUrl),
        this.firebaseRepo.uploadFile(uuid, avatar.buffer),
      ]);
    }
    user.avatarUrl = uuid;
    await user.save();
    return 'Avatar was updated';
  }

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
