import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export default class CheckAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const cookies = context.switchToHttp().getRequest().cookies;
    if (!cookies.refreshToken) throw new ForbiddenException('Forbidden');
    return true;
  }
}
