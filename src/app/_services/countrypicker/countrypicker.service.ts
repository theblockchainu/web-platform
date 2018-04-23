import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {RequestHeaderService} from '../requestHeader/request-header.service';

@Injectable()
export class CountryPickerService {
	
	public envVariable;
	private options;
	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		public router: Router,
		private requestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
		this.options = this.requestHeaderService.getOptions();
	}
	
	public getCountries() {
		return this.http.get(environment.apiUrl + '/api/countries', this.options)
			.map((response: any) => {
				return response;
			});
	}
	
}
