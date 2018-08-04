import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';

@Injectable()
export class PromocodeService {

  constructor(
    private httpClient: HttpClient,
    private requestHeaderService: RequestHeaderService
  ) { }

  getPromoCode(promoCodeID: string, filter: any) {
    this.httpClient.get(environment.apiUrl + '/api/promoCode?filter=' + JSON.stringify(filter), this.requestHeaderService.options);
  }
}

