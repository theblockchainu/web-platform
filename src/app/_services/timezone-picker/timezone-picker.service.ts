import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {RequestHeaderService} from '../requestHeader/request-header.service';

@Injectable()
export class TimezonePickerService {
	public envVariable;
	private options;
	constructor(
		private http: HttpClient,
		private requestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
		this.options = this.requestHeaderService.getOptions();
	}
	
	public getTimezones(filter: string) {
		return this.http.get(environment.apiUrl + '/api/timezones?filter=' + filter, this.options)
			.map((response: any) => {
				return response;
			});
	}
	
}
