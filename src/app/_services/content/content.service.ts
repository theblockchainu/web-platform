import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import {environment} from '../../../environments/environment';

@Injectable()
export class ContentService {

  public options;
  public envVariable;

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    public router: Router,
    private requestHeaderService: RequestHeaderService) {
    this.options = requestHeaderService.getOptions();
      this.envVariable = environment;
  }

  public getEvents(userId: string) {
    return this.http.get(environment.apiUrl + '/api/peers/' + userId + '/eventCalendar', this.options)
      .map((response: any) => response, (err) => {
        console.log('Error: ' + err);
      });

  }

  public addNewLanguage(name: string) {
    const body = {
      'name': name,
      'code': name
    };
    return this.http.post(environment.apiUrl + '/api/languages', body, this.options)
      .map((response: any) => response, (err) => {
        console.log('Error: ' + err);
      });
  }

  public getMediaObject(urlString: string) {
    const query = {
      'where':
        {
          url: urlString
        }
    };
    return this.http.get(environment.apiUrl + '/api/media?filter=' + JSON.stringify(query), this.options)
      .map((response: any) =>
        response,
        (err) => {
          console.log('Error:' + err);
        }
      );
  }



  public createRSVP(contentId, calendarId) {
    const body = {
      'contentId': contentId,
      'calendarId': calendarId
    };
    return this.http
      .post(environment.apiUrl + '/api/contents/' + contentId + '/rsvps', body, this.options)
      .map((response: any) => response);
  }
}
