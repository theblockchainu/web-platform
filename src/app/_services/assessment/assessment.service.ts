import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AssessmentService {

  constructor(private httpClient: HttpClient,
    public _requestHeaderService: RequestHeaderService
  ) {
  }

  public submitAssessment(assessment: Array<AssessmentResult>) {
    return this.httpClient.post(environment.apiUrl + '/api/assessment_results', assessment, this._requestHeaderService.options);
  }


}

interface AssessmentResult {
  calendarId: string;
  assesserId: string;
  assesseeId: string;
  assessmentRuleId: string;
}
