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
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import CreateArticleDto from 'src/dtos/create-article.dto';
import ArticleAndAccessEntity from 'src/models/article-n-access.entity';
import ToCapitalize from 'src/pipes/to-capitalize';
import ToNumberPipe from 'src/pipes/to-number.pipe';
import ArticleRepo from 'src/repositories/article/article.repository';
import ArticleService from 'src/services/article.service';
import { Request } from 'src/types/overwritten-request';

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
    @Query('is-private') isPrivate: boolean,
  ) {}

  @Get(':id')
  public async getSingleArticle(@Param('id', ToNumberPipe) id: number, @Req() req: Request) {
    const article = await this.articleRepo.getArticleById(id);
    this.articleService.checkIsArticleExist(article);
    let roles: { rows: ArticleAndAccessEntity[]; count: number } = null;
    if (article) {
      roles = await this.articleService.checkRolesOfArticle(article, req.user?.id);
    }
    return { article, roles };
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

  @Put(':id')
  public async modifyArticle() {}

  @Delete(':id')
  public async deleteArticle() {}

  @Get()
  public async getArticles(
    @Query('search', ToCapitalize) search: string,
    @Query('tags') tags: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    const resPage = page ?? 1;
    const resLimit = limit ?? 10;
    const offset = resPage * resLimit - resLimit;
    const resTags = tags ? tags.split(';').map(Number) : [];
    return this.articleRepo.getArticles(search ?? '', resTags, offset, resLimit);
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
    const tags = article.tags.split(';').map(Number);
    await this.articleRepo.createRelatedArticleTags(tags, articleInstance.id);
    return articleInstance;
  }
}
