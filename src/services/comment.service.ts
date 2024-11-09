import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import ArticleRepo from '../repositories/article/article.repository';
import UserRepo from '../repositories/user/user.repository';
import { PERMISSIONS } from '../utils/define-permissions';
import { USER_ROLES } from '../types/user-roles';
import { RateRequest } from '../types/rate-request';

@Injectable()
export default class CommentService {
  constructor(
    private userRepo: UserRepo,
    private articleRepo: ArticleRepo,
  ) {}

  private async checkUserAccessToAction(articleId: number, userId: number, commentId: number) {
    const [access, comment] = await Promise.all([
      this.checkRoleAndPermissionForComments(articleId, userId),
      this.articleRepo.getCommentById(commentId),
    ]);

    if (this.isActionAvailablePredicate(access.roleId, access.permission, userId)) {
      throw new ForbiddenException('Forbidden');
    }

    return comment;
  }

  private isActionAvailablePredicate(roleId: number, permission: string, userId: number) {
    return !(
      roleId === USER_ROLES.MODERATOR ||
      permission === PERMISSIONS.OWNER ||
      permission === PERMISSIONS.MODIFY ||
      userId === userId
    );
  }

  private async checkRoleAndPermissionForComments(articleId: number, userId: number) {
    const [user, permission] = await Promise.all([
      this.userRepo.findById(userId),
      this.articleRepo.checkPermissionOfUser(userId, articleId),
    ]);

    return { roleId: user.roleId, permission: permission.permission.name };
  }

  public async getComments(page: number, articleId: number, userId?: number) {
    const count = 10;
    const offset = page * count - count;
    return this.articleRepo.getComments(offset, count, articleId, userId);
  }

  public async createComment(articleId: number, userId: number, content: string) {
    return this.articleRepo.createComment(articleId, userId, content);
  }

  public async updateComment(articleId: number, commentId: number, userId: number, content: string) {
    const comment = await this.checkUserAccessToAction(articleId, userId, commentId);

    comment.content = content;
    await comment.save();

    return comment;
  }

  public async deleteComment(articleId: number, commentId: number, userId: number) {
    const comment = await this.checkUserAccessToAction(articleId, userId, commentId);

    await comment.destroy();

    return { message: 'deleted' };
  }

  public async rateComment(commentId: number, userId: number, rate: RateRequest) {
    if (!rate.rate || !rate.action) throw new BadRequestException('Bad request');
    return this.articleRepo.updateCommentRate(rate, commentId, userId);
  }
}
