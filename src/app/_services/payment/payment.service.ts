import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import {environment} from '../../../environments/environment';
@Injectable()
export class PaymentService {
  public key = 'userId';
  private options;
  public envVariable;

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    public router: Router,
    private authService: AuthenticationService,
    public _requestHeaderService: RequestHeaderService,
    private _cookieUtilsService: CookieUtilsService
  ) {
      this.envVariable = environment;
    this.options = this._requestHeaderService.getOptions();
  }

  makePayment(userId, customerId: any, body: any) {
    if (userId) {
      return this.http.post(environment.apiUrl + '/api/create-source/' + customerId, body, this.options);
    }
  }

  createSource(userId, customerId: any, body: any) {
    if (userId) {
      return this.http.post(environment.apiUrl + '/api/transactions/create-source/' + customerId, body, this.options);
    }
  }

  createCharge(userId, collectionId: any, body: any) {
    if (userId) {
      return this.http.post(environment.apiUrl + '/api/transactions/create-charge/collection/' + collectionId, body, this.options);
    }
  }

  listAllCards(userId, customerId: any) {
    if (userId) {
      return this.http.get(environment.apiUrl + '/api/transactions/list-all-cards/' + customerId, this.options);
    }
  }

  deleteCard(userId, customerId: string, cardId: string) {
    if (userId) {
      return this.http.delete(environment.apiUrl + '/api/transactions/delete-card/' + customerId + '/' + cardId, this.options);
    }
  }

  public getCollectionDetails(id: string) {
    const filter = `{"include": [{"owners":"profiles"},"calendars",{"contents":"schedules"}]}`;
    return this.http
      .get(environment.apiUrl + '/api/collections/' + id + '?filter=' + filter)
      .map((response: any) => response, (err) => {
        console.log('Error: ' + err);
      });

  }

  public createConnectedAccount(authcode: string, error?: any, errDescription?: any): Observable<any> {
    if (error) {
      return this.http.get(environment.apiUrl + '/api/payoutaccs/create-connected-account?error='
        + error + '&errorDesc=' + errDescription, this.options).map((response: any) => response, (err) => {
          console.log('Error: ' + err);
        });
    } else {
      console.log(authcode);

      return this.http.get(environment.apiUrl
        + '/api/payoutaccs/create-connected-account?authCode=' + authcode, this.options).map((response: any) => response, (err) => {
          console.log('Error: ' + err);
        });
    }
  }
  /**
   * retrieveConnectedAccount
   */
  public retrieveConnectedAccount(): Observable<any> {
    return this.http.get(environment.apiUrl + '/api/payoutaccs/retrieve-connected-accounts', this.options)
      .map((response: any) => response, (err) => {
        console.log('Error: ' + err);
      });
  }
  /**
   * createLoginLink
   */
  public createLoginLink(accountId: string): Observable<any> {
    return this.http.get(environment.apiUrl + '/api/payoutaccs/create-login-link?accountId=' + accountId, this.options)
      .map((response: any) => response, (err) => {
        console.log('Error: ' + err);
      });
  }

  /**
   * getTransactions
   */
  public getTransactions(userId, filter?: any): Observable<any> {
    if (filter) {
      return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/transactions?filter=' + JSON.stringify(filter), this.options)
        .map((response: any) => response, (err) => {
          console.log('Error: ' + err);
        });
    } else {
      return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/transactions', this.options)
        .map((response: any) => response, (err) => {
          console.log('Error: ' + err);
        });
    }
  }

  /**
   * convertCurrency
   */
  public convertCurrency(amount: number, from: string) {
    const body = {
      'from': from,
      'to': this._cookieUtilsService.getValue('currency'),
      'amount': amount
    };
    console.log(body);
    /*if (from.length === 3 && this._cookieUtilsService.getValue('currency').length === 3) {*/
    return this.http.post(environment.apiUrl + '/convertCurrency', body, this.options)
      .map((response: any) => {
        const res = response;
        console.log(res);
        if (res.success) {
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
      });
    // }
  }

  /**
   * patchPayoutRule
   */
  public patchPayoutRule(payoutRuleId: string, newPayoutId: string) {
    return this.http.patch(environment.apiUrl + '/api/payoutrules/' + payoutRuleId, {
      'payoutId1': newPayoutId
    }, this.options).map(result => result);
  }

  /**
   * postPayoutRule
   */
  public postPayoutRule(collectionId: string, newPayoutId: string) {
    const body = {
      'percentage1': 100,
      'payoutId1': 'string'
    };
    return this.http.post(environment.apiUrl + '/api/collections/'
      + collectionId + '/payoutrules', body, this.options).map(result => result);
  }

  /**
   * retrieveLocalPayoutAccounts
   */
  public retrieveLocalPayoutAccounts() {
    return this.http.get(environment.apiUrl + '/api/peers/'
      + this._cookieUtilsService.getValue('userId') + '/payoutaccs', this.options).map(result => result);
  }

}
