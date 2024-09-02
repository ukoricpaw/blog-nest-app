import { Body, Controller, Get, Post } from '@nestjs/common';
import CreateUserDto from 'src/dtos/create-user.dto';
import UserDto from 'src/dtos/user.dto';
import TokenService from 'src/services/token.service';
import UserService from 'src/services/user.service';
import { UserResponse } from 'src/types/user.response';

@Controller({
  path: '/user',
})
export default class UserController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  @Get('/refresh')
  public refresh(): void {}

  @Post('/login')
  public login(@Body() body: CreateUserDto): void {
    console.log(body.email, body.password);
  }

  @Post('/registration')
  public async registration(@Body() body: CreateUserDto): Promise<UserResponse> {
    const user = await this.userService.registration(body);
    const userDto = new UserDto(user);
    const accessToken = this.tokenService.createAccessToken(userDto);
    const refreshToken = this.tokenService.createRefreshToken(userDto);
    await this.tokenService.createOrChangeToken(refreshToken, userDto.id);
    return this.userService.transformToResponse(userDto, { access: accessToken, refresh: refreshToken });
  }
}
