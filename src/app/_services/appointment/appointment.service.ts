import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppointmentService {

  constructor(private http: HttpClient) { }

  getEvents() {
    return this.http.get('assets/showcase/data/scheduleevents.json')
      .toPromise()
      .then(res => <any[]>res['data'])
      .then(data => data);
    // .subscribe((res) => {
    //   return res .data;
    // })
  }
}
