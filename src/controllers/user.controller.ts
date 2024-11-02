import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Request as OverwrittenRequest } from 'src/types/overwritten-request';
import CreateUserDto from 'src/dtos/create-user.dto';
import UserDto from 'src/dtos/user.dto';
import CheckAccessTokenGuard from 'src/guards/check-access-token.guard';
import CheckAuthGuard from 'src/guards/check-auth.guard';
import UserEntity from 'src/models/user.entity';
import CookieService from 'src/services/cookie.service';
import TokenService from 'src/services/token.service';
import UserService from 'src/services/user.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller({
  path: '/user',
})
@UseInterceptors(FileInterceptor('file'))
export default class UserController {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private cookieService: CookieService,
  ) {}

  public async getUserResponse(data: UserEntity, res: Response) {
    const userDto = new UserDto(data);
    const tokens = this.tokenService.createTokens(userDto);
    await this.tokenService.createOrChangeToken(tokens.refresh, userDto.id);
    this.cookieService.saveTokens(res, tokens);
    const response = this.userService.transformToResponse(userDto, tokens);
    return response;
  }

  @Patch('/')
  public async changeUserAvatar(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 10_000_000 })],
      }),
    )
    avatar: Express.Multer.File,
    @Body() body: { toDelete: boolean },
    @Req() req: OverwrittenRequest,
  ) {
    return this.userService.changeUserAvatar(req.user.email, avatar, body.toDelete);
  }

  @UseGuards(CheckAccessTokenGuard)
  @Get('/logout')
  public async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken;
    await this.tokenService.removeToken(refreshToken);
    this.cookieService.clearCookies(res);
    res.json({ response: 'User has left from system' });
  }

  @UseGuards(CheckAuthGuard)
  @Get('/refresh')
  public async refresh(@Req() req: Request, @Res() res: Response) {
    const data = this.tokenService.verifyRefreshToken(req.cookies.refreshToken);
    const user = await this.userService.checkExistingUser(data.email);
    const response = await this.getUserResponse(user, res);
    this.cookieService.saveTokens(res, { access: response.access, refresh: response.refresh });
    res.json(response);
  }

  @Get('/:id')
  public async getUserInfo(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post('/login')
  public async login(@Body() body: CreateUserDto, @Res() res: Response) {
    const user = await this.userService.login(body);
    const response = await this.getUserResponse(user, res);
    res.json(response);
  }

  @Post('/registration')
  public async registration(@Body() body: CreateUserDto, @Res() res: Response) {
    const user = await this.userService.registration(body);
    const response = await this.getUserResponse(user, res);
    res.json(response);
  }
}
