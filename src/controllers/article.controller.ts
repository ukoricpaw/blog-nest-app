import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import PermissionDto from 'src/dtos/permission.dto';
import ArticleAndAccessEntity from 'src/models/article-n-access.entity';
import ToCapitalize from 'src/pipes/to-capitalize';
import ToNumberPipe from 'src/pipes/to-number.pipe';
import ArticleRepo from 'src/repositories/article/article.repository';
import ArticleService from 'src/services/article.service';
import { Request } from 'src/types/overwritten-request';
import { RateRequest } from 'src/types/rate-request';
import { PERMISSIONS } from 'src/utils/define-permissions';
import { getOffsetAndTagsFromRequest } from 'src/utils/get-offset-n-tags';
import { USER_ROLES } from '../types/user-roles';
import { ActiveTypes } from '../types/active-types';

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

  @Get('search')
  public async searchArticles(
    @Req() req: Request,
    @Query('to-moderate') toModerate: boolean,
    @Query('title') search: string,
  ) {
    if (req.user?.roleId !== USER_ROLES.MODERATOR && toModerate) throw new ForbiddenException('Forbidden');
    return this.articleRepo.getArticlesBySearch(search, toModerate);
  }

  @Get(':id')
  public async getSingleArticle(
    @Param('id', ToNumberPipe) id: number,
    @Query('to-edit') toEdit: boolean,
    @Req() req: Request,
  ) {
    const article = await this.articleRepo.getArticleById(id);
    if (
      (toEdit && article?.userId !== req.user.id) ||
      (article?.articleActiveType === ActiveTypes.MODERATION && req.user?.roleId !== USER_ROLES.MODERATOR)
    )
      throw new ForbiddenException('Forbidden');
    this.articleService.checkIsArticleExist(article);
    let role: ArticleAndAccessEntity = null;
    if (article) {
      role = await this.articleService.checkRolesOfArticle(article, req.user);
    }
    article.inviteLink = role && role.permission.name === PERMISSIONS.OWNER ? article.inviteLink : null;
    return {
      article,
      role,
    };
  }

  @Get('invite/:link')
  public async inviteToPrivateArticle(@Param('link') link: string, @Req() req: Request) {
    const article = await this.articleRepo.getArticleByLink(link);
    this.articleService.checkArticleIsPrivate(article);
    const roleOfUser = await this.articleRepo.getUserPermissionOfArticle(req.user.id, article.id);
    if (roleOfUser) throw new BadRequestException('User already has permission');
    await this.articleRepo.createRole(article.id, PERMISSIONS.READ, req.user.id);
    return { message: 'Invitation accepted' };
  }

  @Post(':id/permission')
  public async setPermissionToArticle(
    @Body() permissionDto: PermissionDto,
    @Param('id') articleId: number,
    @Req() req: Request,
  ) {
    return this.articleService.setPermissionToArticle(permissionDto, articleId, req.user.id);
  }

  @Delete(':id/permission/:userId')
  public async deletePermissionFromArticle(
    @Param('id', ToNumberPipe) articleId: number,
    @Param('userId', ToNumberPipe) userId: number,
    @Req() req: Request,
  ) {
    return this.articleService.deletePermissionFromArticle(articleId, userId, req.user.id);
  }

  @Get(':id/views')
  public async addViewToArticle(@Param('id') articleId: number) {
    const article = await this.articleRepo.getArticleById(articleId);
    await this.articleService.incrementQtyOfViews(article);
    return { message: 'viewed' };
  }

  @Get(':id/rate')
  public async getArticleRate(@Param('id') articleId: number, @Req() req: Request) {
    return this.articleRepo.getArticleRate(articleId, req.user?.id);
  }

  @Post(':id/rate')
  public async rateArticle(@Param('id') articleId: number, @Body() rate: RateRequest, @Req() req: Request) {
    return this.articleRepo.addOrChangeRateToArticle(rate, articleId, req.user.id);
  }

  @Patch(':id')
  public async modifyArticle(
    @Body() article: PatchArticleDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 10_000_000 })],
      }),
    )
    thumbnail: Express.Multer.File,
    @Param('id', ToNumberPipe) id: number,
    @Req() req: Request,
  ) {
    const articleResult = await this.articleRepo.getArticleById(id);
    if (articleResult?.articleActiveType === ActiveTypes.MODERATION) throw new ForbiddenException('Forbidden');
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
    @Query('sort') sort: 'desc' | 'asc',
    @Req() req: Request,
  ) {
    const { offset, resTags, resLimit } = getOffsetAndTagsFromRequest(page, limit, tags);
    return this.articleRepo.getArticles(
      search ?? '',
      resTags,
      offset,
      resLimit,
      { user: req.user },
      sort?.toUpperCase() as 'DESC' | 'ASC',
    );
  }

  @Post()
  public async createArticle(
    @Body() article: CreateArticleDto,
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10_000_000 })],
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
