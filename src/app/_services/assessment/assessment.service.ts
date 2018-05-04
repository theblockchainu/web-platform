import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AssessmentService {

  private options;

  constructor(private httpClient: HttpClient,
    public _requestHeaderService: RequestHeaderService
  ) {
    this.options = this._requestHeaderService.getOptions();
  }

  public submitAssessment(assessment: Array<AssessmentResult>) {
    return this.httpClient.post(environment.apiUrl + '/api/assessment_results', assessment, this.options);
  }


}

interface AssessmentResult {
  calendarId: string;
  assesserId: string;
  assesseeId: string;
  assessmentRuleId: string;
}
