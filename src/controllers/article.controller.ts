import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import CreateArticleDto, { PatchArticleDto } from 'src/dtos/create-article.dto';
import ArticleAndAccessEntity from 'src/models/article-n-access.entity';
import ToCapitalize from 'src/pipes/to-capitalize';
import ToNumberPipe from 'src/pipes/to-number.pipe';
import ArticleRepo from 'src/repositories/article/article.repository';
import ArticleService from 'src/services/article.service';
import { Request } from 'src/types/overwritten-request';
import { PERMISSIONS } from 'src/utils/define-permissions';
import { getOffsetAndTagsFromRequest } from 'src/utils/get-offset-n-tags';

@Controller({
  path: '/article',
})
@UseInterceptors(FileInterceptor('file'))
export default class ArticleController {
  constructor(
    private articleRepo: ArticleRepo,
    private articleService: ArticleService,
  ) {}

  @Get('tags')
  public async getArticleTags(@Query('search', ToCapitalize) search: string) {
    return this.articleRepo.getArticleTags(search ?? '');
  }

  @Get('user')
  public async getUserArticles(
    @Query('search') search: string,
    @Query('tags') tags: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('is-private') isPrivate: boolean,
    @Req() req: Request,
  ) {
    const { offset, resTags, resLimit } = getOffsetAndTagsFromRequest(page, limit, tags);
    return this.articleRepo.getArticles(search ?? '', resTags, offset, resLimit, {
      user: req.user,
      isPrivate,
      forUser: true,
    });
  }

  @Get(':id')
  public async getSingleArticle(@Param('id', ToNumberPipe) id: number, @Req() req: Request) {
    const article = await this.articleRepo.getArticleById(id);
    this.articleService.checkIsArticleExist(article);
    let role: ArticleAndAccessEntity = null;
    if (article) {
      role = await this.articleService.checkRolesOfArticle(article, req.user);
    }
    return { article, role };
  }

  @Get('invite/:link')
  public async inviteToCheckPrivateArticle() {}

  @Post(':id/permission')
  public async setPermissionToArticle() {}

  @Delete(':id/permission')
  public async deletePermissionFromArticle() {}

  @Get(':id/views')
  public async addViewToArticle() {}

  @Patch(':id/rate')
  public async rateArticle() {}

  @Patch(':id')
  public async modifyArticle(
    @Body() article: PatchArticleDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 100_000 })],
      }),
    )
    thumbnail: Express.Multer.File,
    @Param('id', ToNumberPipe) id: number,
    @Req() req: Request,
  ) {
    const articleResult = await this.articleRepo.getArticleById(id);
    const role = await this.articleService.checkRolesOfArticle(articleResult, req.user);
    return this.articleService.modifyArticle(article, thumbnail?.buffer, articleResult, role);
  }

  @Delete(':id')
  public async deleteArticle(@Param('id', ToNumberPipe) id: number, @Req() req: Request) {
    return this.articleService.deleteArticle(id, req.user.id, req.user.roleId);
  }

  @Get()
  public async getArticles(
    @Query('search', ToCapitalize) search: string,
    @Query('tags') tags: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    const { offset, resTags, resLimit } = getOffsetAndTagsFromRequest(page, limit, tags);
    return this.articleRepo.getArticles(search ?? '', resTags, offset, resLimit, { user: req.user });
  }

  @Post()
  public async createArticle(
    @Body() article: CreateArticleDto,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 100_000 })],
      }),
    )
    thumbnail: Express.Multer.File,
  ) {
    const result = await this.articleService.createArticle(article, thumbnail, req.user.id);
    const articleInstance = await this.articleRepo.createArticle(result);
    const tags = article.tags ? article.tags.split(';').map(Number) : [];
    await Promise.all([
      this.articleRepo.createRole(articleInstance.id, PERMISSIONS.OWNER, req.user.id),
      this.articleRepo.createRelatedArticleTags(tags, articleInstance.id),
    ]);
    return articleInstance;
  }
}
