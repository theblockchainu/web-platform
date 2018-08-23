import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'extractTime'
})
export class ExtractTimePipe implements PipeTransform {

  transform(dateString: string, format: string): any {
    const time = moment.utc(dateString).local().format(format);
    return time;
  }

}
