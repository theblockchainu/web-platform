import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

import { RequestHeaderService } from '../requestHeader/request-header.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
@Injectable()
export class PaymentService {
	public key = 'userId';
	public envVariable;

	constructor(private http: HttpClient,
		private route: ActivatedRoute,
		public router: Router,
		private authService: AuthenticationService,
		public _requestHeaderService: RequestHeaderService,
		private _cookieUtilsService: CookieUtilsService
	) {
		this.envVariable = environment;
	}

	makePayment(userId, customerId: any, body: any) {
		if (userId) {
			return this.http.post(environment.apiUrl + '/api/create-source/' + customerId, body, this._requestHeaderService.options);
		}
	}

	createSource(userId, customerId: any, body: any) {
		if (userId) {
			return this.http.post(environment.apiUrl + '/api/transactions/create-source/' + customerId, body, this._requestHeaderService.options);
		}
	}

	createCharge(userId, collectionId: any, body: any) {
		if (userId) {
			return this.http.post(environment.apiUrl + '/api/transactions/create-charge/collection/' + collectionId, body, this._requestHeaderService.options);
		}
	}

	createContentCharge(userId, contentId: any, body: any) {
		if (userId) {
			return this.http.post(environment.apiUrl + '/api/transactions/create-charge/content/' + contentId, body, this._requestHeaderService.options);
		}
	}

	listAllCards(userId, customerId: any) {
		if (userId) {
			return this.http.get(environment.apiUrl + '/api/transactions/list-all-cards/' + customerId, this._requestHeaderService.options);
		}
	}

	deleteCard(userId, customerId: string, cardId: string) {
		if (userId) {
			return this.http.delete(environment.apiUrl + '/api/transactions/delete-card/' + customerId + '/' + cardId, this._requestHeaderService.options);
		}
	}

	public getCollectionDetails(id: string) {
		const filter = `{"include": [{"owners":"profiles"},"calendars",{"contents":"schedules"},
      { "assessment_models": ["assessment_na_rules", "assessment_rules"] }
	]}`;
		return this.http
			.get(environment.apiUrl + '/api/collections/' + id + '?filter=' + filter, this._requestHeaderService.options)
			;

	}

	public createConnectedAccount(authcode: string, error?: any, errDescription?: any): Observable<any> {
		if (error) {
			return this.http.get(environment.apiUrl + '/api/payoutaccs/create-connected-account?error=' + error + '&errorDesc=' + errDescription, this._requestHeaderService.options);
		} else {
			console.log(authcode);
			return this.http.get(environment.apiUrl + '/api/payoutaccs/create-connected-account?authCode=' + authcode, this._requestHeaderService.options);
		}
	}
	/**
	 * retrieveConnectedAccount
	 */
	public retrieveConnectedAccount(): Observable<any> {
		return this.http.get(environment.apiUrl + '/api/payoutaccs/retrieve-connected-accounts', this._requestHeaderService.options)
			;
	}
	/**
	 * createLoginLink
	 */
	public createLoginLink(accountId: string): Observable<any> {
		return this.http.get(environment.apiUrl + '/api/payoutaccs/create-login-link?accountId=' + accountId, this._requestHeaderService.options)
			;
	}

	/**
	 * getTransactions
	 */
	public getTransactions(userId, filter?: any): Observable<any> {
		if (filter) {
			return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/transactions?filter=' + JSON.stringify(filter), this._requestHeaderService.options)
				;
		} else {
			return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/transactions', this._requestHeaderService.options)
				;
		}
	}

	/**
	 * convertCurrency
	 */
	public convertCurrency(amount: number, from: string, to?: number): Observable<{ amount: number, currency: string }> {
		const body = {
			'from': from,
			'to': (to) ? to : this._cookieUtilsService.getValue('currency'),
			'amount': amount
		};
		console.log(body);
		/*if (from.length === 3 && this._cookieUtilsService.getValue('currency').length === 3) {*/
		return this.http.post(environment.apiUrl + '/convertCurrency', body, this._requestHeaderService.options)
			.pipe(map((response: any) => {
				const res = response;
				console.log(res);
				if (res && res.success) {
					return {
						amount: res.result,
						currency: this._cookieUtilsService.getValue('currency')
					};
				} else {
					return {
						amount: amount,
						currency: from
					};
				}

			}, (err) => {
				return {
					amount: amount,
					currency: from
				};
			}));
		// }
	}

	/**
	 * patchPayoutRule
	 */
	public patchPayoutRule(payoutRuleId: string, newPayoutId: string) {
		return this.http.patch(environment.apiUrl + '/api/payoutrules/' + payoutRuleId, { 'payoutId1': newPayoutId }, this._requestHeaderService.options)
			;
	}

	/**
	 * postPayoutRule
	 */
	public postPayoutRule(collectionId: string, newPayoutId: string) {
		const body = {
			'percentage1': 100,
			'payoutId1': 'string'
		};
		return this.http.post(environment.apiUrl + '/api/collections/' + collectionId + '/payoutrules', body, this._requestHeaderService.options);
	}

	/**
	 * retrieveLocalPayoutAccounts
	 */
	public retrieveLocalPayoutAccounts() {
		return this.http.get(environment.apiUrl + '/api/peers/' + this._cookieUtilsService.getValue('userId') + '/payoutaccs', this._requestHeaderService.options);
	}

	public getUserCountry() {
		return this.http.get('http://ip-api.com/json');
	}
	
	public getCCAvenueEncryptedRequest(body) {
		return this.http.post(environment.apiUrl + '/api/transactions/ccavenueencryptdata', body, this._requestHeaderService.options);
	}

}
