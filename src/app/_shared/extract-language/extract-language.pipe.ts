import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractLanguage'
})
export class ExtractLanguagePipe implements PipeTransform {

  transform(languageObj: any): any {
    if (Array.isArray(languageObj)) {

    } else {

    }
    return null;
  }

}
