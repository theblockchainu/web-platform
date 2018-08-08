import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';

@Injectable()
export class CurrencyPickerService {
	public envVariable;
	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private requestHeaderService: RequestHeaderService,
		public router: Router) {
		this.envVariable = environment;
	}

	/**
	 * Get currencies from server
	 * @returns {Observable<any>}
	 */
	public getCurrencies() {
		return this.http.get(environment.apiUrl + '/api/currencies', this.requestHeaderService.options);
	}

}
