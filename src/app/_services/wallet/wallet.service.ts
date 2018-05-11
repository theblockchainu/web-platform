import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import { RequestHeaderService } from '../requestHeader/request-header.service';

@Injectable()
export class WalletService {
	
	private userId: string;
	private options: any;
	constructor(
		private http: HttpClient,
		private _cookieUtilsService: CookieUtilsService,
		private requestHeaderService: RequestHeaderService
	) {
		this.userId = _cookieUtilsService.getValue('userId');
		this.options = requestHeaderService.getOptions();
	}
	
	/**
	 * getWallet
	 */
	public getWallet() {
		return this.http.get(environment.apiUrl + '/api/peers/' + this.userId + '/wallet', this.options)
			.map((response: any) => response, (err) => {
				console.log(err);
				});
	}
	
	
	
	/**
	 * createWallet
	 */
	public createWallet() {
		return this.http.post(environment.apiUrl + '/api/peers/' + this.userId + '/wallet', {
			'gyan_balance': 0,
			'karma_balance': 0
		}, this.options);
		
	}
	
}
