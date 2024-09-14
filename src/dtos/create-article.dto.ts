import { Length, MinLength } from 'class-validator';

export default class CreateArticleDto {
  @Length(30, 100)
  public title: string;
  @MinLength(100)
  public content: string;

  public isPrivate: boolean;

  public tags: string;
}
