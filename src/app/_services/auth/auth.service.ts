import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

import { RequestHeaderService } from '../requestHeader/request-header.service';

import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';

@Injectable()
export class AuthService {
  isLoggedIn = false;
  key = 'access_token';
  private options;

  constructor(
    private _cookieService: CookieUtilsService,
    public _requestHeaderService: RequestHeaderService
  ) {
    this.isLoggedIn = !!this.getCookie(this.key);
    this.options = this._requestHeaderService.getOptions();
  }

  getCookie(key: string): any {
    return this._cookieService.getValue(key);
  }

  removeCookie(key: string) {
    this._cookieService.deleteValue(key);
  }

  login(): void {
    const userToken = this.getCookie('access_token');
    const userId = this.getCookie('userId');
    if (userToken && userId) {
      // logged in so return true
      this.isLoggedIn = true;
    }
  }


  logout(): void {
    this.isLoggedIn = false;
  }
}
