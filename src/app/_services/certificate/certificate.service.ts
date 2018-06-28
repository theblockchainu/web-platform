import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class CertificateService {

  constructor(
    private httpClient: HttpClient,
    private requestHeaderService: RequestHeaderService
  ) { }

  public getCertificate(id: string) {
    return this.httpClient.get(environment.apiUrl + '/api/certificates/' + id, this.requestHeaderService.options);
  }

  public getBlockchainHash(collectionId: string, peerEthAddress: string) {
    return this.httpClient.get(environment.one0xUrl + '/collections/' + collectionId + '/peers/' + peerEthAddress + '/hash', this.requestHeaderService.options);
  }

}
