import { Pipe, PipeTransform } from '@angular/core';
import * as linkifyStr from 'linkifyjs/string';

@Pipe({ name: 'linkify' })
export class LinkifyPipe implements PipeTransform {
  transform(str: string): string {
    return str ? linkifyStr(str, { target: '_system' }) : str;
  }
}
