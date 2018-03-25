import { Injectable } from '@angular/core';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { HttpClient } from '@angular/common/http';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import {environment} from '../../../environments/environment';


@Injectable()
export class TwilioServicesService {
  public userId;
  private options;
  public envVariable;

  constructor(
    public _requestHeaderService: RequestHeaderService,
    private http: HttpClient,
    private _cookieService: CookieUtilsService
  ) {
      this.envVariable = environment;
    this.userId = this._cookieService.getValue('userId');
    this.options = this._requestHeaderService.getOptions();
  }


  /**
   * getToken
   */
  public getToken() {
    return this.http.get(environment.apiUrl + '/api/vsessions/token', this.options)
      .map(
        (response) => response
      );
  }


}
