import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import { RequestHeaderService } from '../requestHeader/request-header.service';

@Injectable()
export class WalletService {

	private userId: string;
	constructor(
		private http: HttpClient,
		private _cookieUtilsService: CookieUtilsService,
		private requestHeaderService: RequestHeaderService
	) {
		this.userId = _cookieUtilsService.getValue('userId');
	}

	/**
	 * getWallet
	 */
	public getWallet() {
		return this.http.get(environment.apiUrl + '/api/peers/' + this.userId + '/wallet', this.requestHeaderService.options)
			.map((response: any) => response, (err) => {
				console.log(err);
			});
	}

	public fixWallet(userId, body) {
		return this.http
			.post(environment.apiUrl + '/api/peers/' + userId + '/fixWallet', body, this.requestHeaderService.options)
			.map(
				(response: any) => response,
				(err) => {
					console.log('Error: ' + err);
				});

	}
	
	public getKarmaSupply() {
		return this.http
			.get(environment.apiUrl + '/api/peers/karmaSupply', this.requestHeaderService.options)
			.map(
				(response: any) => response,
				(err) => {
					console.log('Error: ' + err);
				});
		
	}
	
	public karmaToDollar(karma) {
		return this.http
			.get(environment.apiUrl + '/karmaToDollar?karma=' + karma, this.requestHeaderService.options)
			.map(
				res => res['USD'],
				err => console.log('Error: ' + err)
			);
	}
	
	public gyanToDollar(gyan) {
		return this.http
			.get(environment.apiUrl + '/gyanToDollar?karma=' + gyan, this.requestHeaderService.options)
			.map(
				res => res['USD'],
				err => console.log('Error: ' + err)
			);
	}

	/**
	 * createWallet
	 */
	public createWallet() {
		return this.http.post(environment.apiUrl + '/api/peers/' + this.userId + '/wallet', {
			'gyan_balance': 0,
			'karma_balance': 0
		}, this.requestHeaderService.options);

	}

}
