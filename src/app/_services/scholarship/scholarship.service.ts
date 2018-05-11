import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
@Injectable()
export class ScholarshipService {
  private options;

  constructor(
    private http: HttpClient,
    private _requestHeaderService: RequestHeaderService,
    private _cookieUtilsService: CookieUtilsService
  ) {
    this.options = this._requestHeaderService.getOptions();
  }

  public createScholarship(body: any) {
    return this.http.post(environment.apiUrl + '/api/peers/' + this._cookieUtilsService.getValue('userId')
      + '/scholarships_owned', body, this.options);
  }

  public fetchScholarships(filter: any) {
    return this.http.get(environment.apiUrl + '/api/scholarships?filter=' + JSON.stringify(filter), this.options);
  }

  public fetchScholarship(scholarshipId: string, filter: any) {
    return this.http.get(environment.apiUrl + '/api/scholarships/' + scholarshipId + '?filter=' + JSON.stringify(filter), this.options);
  }

  /**
   * deleteScholarship
id:string   */
  public deleteScholarship(id: string) {
    return this.http.delete(environment.apiUrl + '/api/scholarships/' + id, this.options);
  }


  public patchScholarship(id: string, body: any) {
    return this.http.patch(environment.apiUrl + '/api/scholarships/' + id, body, this.options);
  }

  public fetchUserScholarships(filter: any) {
    return this.http.get(environment.apiUrl + '/api/peers/' + this._cookieUtilsService.getValue('userId')
      + '/scholarships_joined?filter=' + JSON.stringify(filter), this.options);
  }

  public fetchUserHostedScholarships(filter: any) {
    return this.http.get(environment.apiUrl + '/api/peers/' + this._cookieUtilsService.getValue('userId')
      + '/scholarships_owned?filter=' + JSON.stringify(filter), this.options);
  }

  public connectCollections(id: string, targetIds: Array<any>) {
    return this.http.patch(environment.apiUrl + '/api/scholarships/' + id + '/allowed_collections/rel', {
      targetIds: targetIds
    }, this.options);
  }

  public joinScholarship(userId: string, scholarshipId: string) {
    return this.http.put(environment.apiUrl + '/api/scholarships/' + scholarshipId + '/peers_joined/rel/' + userId, {}, this.options);
  }

  public leaveScholarship(userId: string, scholarshipId: string) {
    return this.http.delete(environment.apiUrl + '/api/scholarships/' + scholarshipId + '/peers_joined/rel/' + userId, this.options);
  }
}
