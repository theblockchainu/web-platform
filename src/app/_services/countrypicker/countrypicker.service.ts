import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';

@Injectable()
export class CountryPickerService {

	public envVariable;
	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		public router: Router,
		private requestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
	}

	public getCountries() {
		return this.http.get(environment.apiUrl + '/api/countries', this.requestHeaderService.options)
			.map((response: any) => {
				return response;
			});
	}

}
