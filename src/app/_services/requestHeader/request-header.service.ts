import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/map';

class RequestOptions {

  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  observe?: 'body';
  params?: HttpParams | {
    [param: string]: string | string[];
  };
  reportProgress?: boolean;
  responseType: 'arraybuffer';
  withCredentials?: boolean;

}

@Injectable()
export class RequestHeaderService {

  constructor(
    private http: HttpClient) {
  }

  getOptions() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    const options = new RequestOptions();
    options.headers = headers;
    options.withCredentials = true;
    return options;
  }

}
