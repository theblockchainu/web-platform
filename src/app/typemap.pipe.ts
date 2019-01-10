import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typemap'
})
export class TypemapPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
