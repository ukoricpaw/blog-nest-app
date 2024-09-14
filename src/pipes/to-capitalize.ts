import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export default class ToCapitalize implements PipeTransform {
  transform(value: string) {
    if (!value) return '';
    return value[0].toUpperCase() + value.slice(1);
  }
}
