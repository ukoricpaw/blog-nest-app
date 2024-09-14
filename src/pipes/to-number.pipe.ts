import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export default class ToNumberPipe implements PipeTransform {
  transform(value: string) {
    const result = Number(value);
    if (Number.isNaN(result)) throw new BadRequestException('Not valid param');
    return result;
  }
}
