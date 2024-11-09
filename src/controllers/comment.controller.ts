import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req } from '@nestjs/common';
import { Request } from '../types/overwritten-request';
import CommentService from '../services/comment.service';
import ToNumberPipe from '../pipes/to-number.pipe';
import { RateRequest } from '../types/rate-request';

@Controller('/comment')
export default class CommentController {
  constructor(private commentService: CommentService) {}

  @Post(':articleId')
  public createComment(
    @Param('articleId', ToNumberPipe) articleId: number,
    @Req() req: Request,
    @Body() body: { content: string },
  ) {
    return this.commentService.createComment(articleId, req.user.id, body.content);
  }

  @Get(':articleId')
  public getComments(@Param('articleId') articleId: number, @Req() req: Request, @Query('page') page: number) {
    return this.commentService.getComments(page || 1, articleId, req.user?.id);
  }

  @Delete(':articleId/:commentId')
  public deleteComment(
    @Param('commentId') commentId: number,
    @Param('articleId') articleId: number,
    @Req() req: Request,
  ) {
    return this.commentService.deleteComment(articleId, commentId, req.user.id);
  }

  @Put(':articleId/:commentId')
  public updateComment(
    @Param('commentId') commentId: number,
    @Param('articleId') articleId: number,
    @Req() req: Request,
    @Body() body: { content: string },
  ) {
    return this.commentService.updateComment(articleId, commentId, req.user.id, body.content);
  }

  @Patch(':commentId/rate')
  public rateComment(@Param('commentId') commentId: number, @Req() req: Request, @Body() body: RateRequest) {
    return this.commentService.rateComment(commentId, req.user.id, body);
  }
}
