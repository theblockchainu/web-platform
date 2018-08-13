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
    this.httpClient.get(environment.apiUrl + '/api/promoCodes?filter=' + JSON.stringify(filter), this.requestHeaderService.options);
  }

  deletePromoCode(promoCodeId) {
    return this.httpClient.delete(environment.apiUrl + '/api/promoCodes/' + promoCodeId, this.requestHeaderService.options);
  }

  public patchPromoCode(promoCodesId: string, promoCodeObj: any) {
    return this.httpClient.patch(environment.apiUrl + '/api/promoCodes/' + promoCodesId, promoCodeObj, this.requestHeaderService.options);
  }

}

