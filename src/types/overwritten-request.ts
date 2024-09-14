import { Request as ExpressRequest } from 'express';
import UserDto from 'src/dtos/user.dto';
export type Request = ExpressRequest & { user: ReturnType<UserDto['toJSON']> };
