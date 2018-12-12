import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';

@Injectable()
export class CorestackService {

  constructor(
    private httpClient: HttpClient,
    private requestHeaderService: RequestHeaderService
  ) {
  }

  getAccessDetails(studentId: string, courseId: string) {
    return this.httpClient.get(environment.apiUrl + '/api/corestack_students/' + studentId +
      '/course/' + courseId + '/access_details', this.requestHeaderService.options);
  }

}
