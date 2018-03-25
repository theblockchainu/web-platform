import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable()
export class TimezonePickerService {
    public envVariable;

  constructor(private http: HttpClient) {
      this.envVariable = environment;
  }

  public getTimezones(filter: string) {
    return this.http.get(environment.apiUrl + '/api/timezones?filter=' + filter)
      .map((response: any) => {
        return response;
      });
  }

}
