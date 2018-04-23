import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { HttpClient } from '@angular/common/http';
import {RequestHeaderService} from '../requestHeader/request-header.service';

@Injectable()
export class AppointmentService {
	
	private options;
	constructor(
		private http: HttpClient,
		private requestHeaderService: RequestHeaderService
	) {
		this.options = this.requestHeaderService.getOptions();
	}
	
	getEvents() {
		return this.http.get('assets/showcase/data/scheduleevents.json', this.options)
			.toPromise()
			.then(res => <any[]>res['data'])
			.then(data => data);
		// .subscribe((res) => {
		//   return res .data;
		// })
	}
}
