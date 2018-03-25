import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable()
export class CountryPickerService {

    public envVariable;
  constructor(private http: HttpClient
    , private route: ActivatedRoute, public router: Router) {
      this.envVariable = environment;
  }

  public getCountries() {
    return this.http.get(environment.apiUrl + '/api/countries')
      .map((response: any) => {
        return response;
      });
  }

}
