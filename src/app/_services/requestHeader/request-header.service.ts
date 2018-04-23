import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import {CookieUtilsService} from '../cookieUtils/cookie-utils.service';

class RequestOptions {
	
	headers?: HttpHeaders | {
		[header: string]: string | string[];
	};
	observe?: 'body';
	params?: HttpParams | {
		[param: string]: string | string[];
	};
	reportProgress?: boolean;
	responseType;
	withCredentials?: boolean;
	
}

@Injectable()
export class RequestHeaderService {
	
	public access_token: string;
	
	constructor(
		private http: HttpClient,
		private cookieService: CookieUtilsService
	) {
		this.access_token = this.cookieService.getValue('access_token');
	}
	
	getOptions() {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'access_token': this.access_token
		});
		const options = new RequestOptions();
		options.headers = headers;
		options.withCredentials = true;
		return options;
	}
	
	getMediaOptions() {
		const headers = new HttpHeaders({
			'access_token': this.access_token
		});
		const options = new RequestOptions();
		options.headers = headers;
		options.withCredentials = true;
		return options;
	}
	
}
