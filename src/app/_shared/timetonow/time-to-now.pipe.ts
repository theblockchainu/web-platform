import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'timeToNow'
})
export class TimeToNowPipe implements PipeTransform {

  transform(dateString): any {
    const time = moment().to(moment(dateString));
    return time;
  }

}
