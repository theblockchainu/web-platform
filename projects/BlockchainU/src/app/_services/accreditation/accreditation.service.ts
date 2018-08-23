import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';

@Injectable()
export class AccreditationService {
  private userId: string;
  public key = 'userId';
  public envVariable;

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    public router: Router,
    private authService: AuthenticationService,
    private requestHeaderService: RequestHeaderService,
    _cookieUtilsService: CookieUtilsService) {
    this.envVariable = environment;
    this.userId = _cookieUtilsService.getValue('userId');
  }

  public createAccreditation(data: any) {
    return this.http.post(environment.apiUrl + '/api/peers/' + this.userId + '/accreditationsCreated', data, this.requestHeaderService.options);
  }

  public deleteAccreditation(accreditationId) {
    return this.http.delete(environment.apiUrl + '/api/accreditations/' + accreditationId, this.requestHeaderService.options);
  }

  public linkTopics(accreditationId, body) {
    return this.http.patch(environment.apiUrl + '/api/accreditations/' + accreditationId + '/topics/rel', body, this.requestHeaderService.options);
  }

  public fetchAccreditation(accreditationId: string, filter: any) {
    return this.http.get(environment.apiUrl + '/api/accreditations/' + accreditationId + '?filter=' + JSON.stringify(filter), this.requestHeaderService.options);
  }

  joinAccreditation(userId: string, accreditationId: string) {
    return this.http.put(environment.apiUrl + '/api/accreditations/' + accreditationId + '/subscribedBy/rel/' + userId, {}, this.requestHeaderService.options);
  }

  leaveAccreditation(userId: string, accreditationId: string) {
    return this.http.delete(environment.apiUrl + '/api/accreditations/' + accreditationId + '/subscribedBy/rel/' + userId, this.requestHeaderService.options);
  }

}
