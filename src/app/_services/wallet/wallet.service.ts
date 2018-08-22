import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { map } from 'rxjs/operators';

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
			;
	}

	public fixWallet(userId, body) {
		return this.http
			.post(environment.apiUrl + '/api/peers/' + userId + '/fixWallet', body, this.requestHeaderService.options)
			;

	}

	public getKarmaSupply() {
		return this.http
			.get(environment.apiUrl + '/api/peers/karmaSupply', this.requestHeaderService.options)
			;

	}

	public karmaToDollar(karma) {
		return this.http
			.get(environment.apiUrl + '/karmaToDollar?karma=' + karma, this.requestHeaderService.options);
	}

	public gyanToDollar(gyan) {
		return this.http
			.get(environment.apiUrl + '/gyanToDollar?gyan=' + gyan, this.requestHeaderService.options);
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

	public getKarmaToBurn(gyan: number) {
		return this.http.post(environment.apiUrl + '/getKarmaToBurn', { gyan: gyan }, this.requestHeaderService.options).pipe(map((res: any) => {
			console.log(res);
			if (res.karma || res.hasOwnProperty('karma') || res['karma']) {
				return res.karma;
			} else {
				return res;
			}
		}));
	}

}
