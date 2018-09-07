import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';

@Injectable()
export class TimezonePickerService {
	public envVariable;
	constructor(
		private http: HttpClient,
		private requestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
	}

	public getTimezones(filter: string) {
		return this.http.get(environment.apiUrl + '/api/timezones?filter=' + filter, this.requestHeaderService.options);
	}

	public postAvailableTimezones() {
		return this.http.post(environment.apiUrl + '/api/timezones/add-timezones', {}, this.requestHeaderService.options);
	}

}
