import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/map';
import {environment} from '../../../environments/environment';

@Injectable()
export class CurrencyPickerService {
    public envVariable;

  constructor(private http: HttpClient
    , private route: ActivatedRoute, public router: Router) {
      this.envVariable = environment;
  }

  /**
   * Get currencies from server
   * @returns {Observable<any>}
   */
  public getCurrencies() {
    return this.http.get(environment.apiUrl + '/api/currencies')
      .map((response: any) => {
        return response;
      });
  }

}
