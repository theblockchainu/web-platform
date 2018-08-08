import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';

@Injectable()
export class CountryPickerService {

	private envVariable;
	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private router: Router,
		private requestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
	}

	public getCountries() {
		return this.http.get(environment.apiUrl + '/api/countries', this.requestHeaderService.options).map((response: any) => {
			return response;
		});
	}

	/**
	 * postInbuiltCountries
	 */
	public postInbuiltCountries() {
		return this.http.post(environment.apiUrl + '/api/countries/add-countries', {}, this.requestHeaderService.options);
	}

}
