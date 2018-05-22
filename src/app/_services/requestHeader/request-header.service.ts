import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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

	private access_token: any;
	public refreshToken = new BehaviorSubject<boolean>(false);
	public options: any;
	public mediaOptions: any;
	constructor(
		private http: HttpClient,
		private cookieService: CookieUtilsService
	) {
		this.access_token = this.cookieService.getValue('access_token');
		console.log('initiating RequestHeaderService');
		this.options = this.createOptions();
		this.mediaOptions = this.getMediaOptions();
		this.refreshToken.subscribe(res => {
			console.log(res);
			if (res) {
				console.log('Refreshing token');
				console.log(this.options);
				this.options = this.createOptions();
				this.mediaOptions = this.getMediaOptions();
				console.log('Refreshed token');
				console.log(this.options);
			}
		});
	}

	createOptions() {
		const access_token = this.cookieService.getValue('access_token');
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'access_token': access_token
		});
		const options = new RequestOptions();
		options.headers = headers;
		options.withCredentials = true;
		console.log('creating access token');
		console.log(options);
		return options;
	}

	getOptions() {
		console.log('getting option');
		console.log(this.options);
		return this.options;
	}

	getMediaOptions() {
		const access_token = this.cookieService.getValue('access_token');
		const headers = new HttpHeaders({
			'access_token': access_token
		});
		const options = new RequestOptions();
		options.headers = headers;
		options.withCredentials = true;
		delete options.headers['Content-type'];
		return options;
	}

}
