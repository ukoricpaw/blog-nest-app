import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';

@Controller('/comment')
export default class CommentController {
  @Post(':articleId')
  public createComment() {}

  @Get(':articleId')
  public getComments() {}

  @Delete(':articleId/:commentId')
  public deleteComment() {}

  @Patch(':articleId/:commentId')
  public updateComment() {}

  @Patch(':articleId/:commentId')
  public rateComment() {}
}
