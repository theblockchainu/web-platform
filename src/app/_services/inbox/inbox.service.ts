import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import {environment} from '../../../environments/environment';
@Injectable()
export class InboxService {
  public key = 'userId';
  private options;
  public envVariable;

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    public router: Router,
    public _requestHeaderService: RequestHeaderService,
    private _cookieUtilsService: CookieUtilsService
  ) {
    this.options = this._requestHeaderService.getOptions();
      this.envVariable = environment;
  }

  getRoomData() {
    const userId = this._cookieUtilsService.getValue(this.key);
    const query = { 'include': ['collection', { 'messages': { 'peer': 'profiles' } }, { 'participants': 'profiles' }] };
    if (userId) {
      return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/joinedRooms?filter=' + JSON.stringify(query), this.options)
        .map(
          (response: any) => response
        );
    }
  }

  postMessage(roomId, body) {
    return this.http.post(environment.apiUrl + '/api/rooms/' + roomId + '/messages', body, this.options)
      .map((response: any) => response);
  }

}
