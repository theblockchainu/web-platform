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

  public getAssessmentItems(fileLocation: string) {
    return this.httpClient.get(fileLocation, this._requestHeaderService.options);
  }


  public getAvailableAssessments(): Array<AssessmentTypeData> {
    return [
      {
        system: 'Standard Grades',
        values: {
          style: 'Grades',
          rules: [
            {
              value: 'A',
              gyan: 100
            },
            {
              value: 'B',
              gyan: 90
            },
            {
              value: 'C',
              gyan: 80
            },
            {
              value: 'D',
              gyan: 70
            },
            {
              value: 'F',
              gyan: 60
            }
          ]
        },
        description: 'A,B,C,D...'
      },
      {
        system: 'Weighted Grades',
        values: {
          style: 'Grades',
          rules: [
            {
              value: 'A+',
              gyan: 100
            },
            {
              value: 'A',
              gyan: 97
            },
            {
              value: 'A-',
              gyan: 93
            },
            {
              value: 'B+',
              gyan: 90
            },
            {
              value: 'B',
              gyan: 87
            },
            {
              value: 'B-',
              gyan: 83
            },
            {
              value: 'C+',
              gyan: 80
            },
            {
              value: 'C',
              gyan: 77
            },
            {
              value: 'C-',
              gyan: 73
            },
            {
              value: 'D+',
              gyan: 70
            },
            {
              value: 'D',
              gyan: 67
            },
            {
              value: 'D-',
              gyan: 63
            },
            {
              value: 'F',
              gyan: 60
            }
          ]
        },
        description: 'A+,A,A-,B+,B,B-...'
      },
      {
        system: 'Percentage',
        values: {
          style: 'Percentage',
          rules: [
            {
              value: '100',
              gyan: 100
            },
            {
              value: '90',
              gyan: 90
            },
            {
              value: '80',
              gyan: 80
            },
            {
              value: '70',
              gyan: 70
            },
            {
              value: '60',
              gyan: 60
            },
            {
              value: '50',
              gyan: 50
            },
            {
              value: '40',
              gyan: 40
            },
            {
              value: '30',
              gyan: 30
            },
            {
              value: '20',
              gyan: 20
            },
            {
              value: '10',
              gyan: 10
            }
          ]
        },
        description: '100,90,80,70...'
      },
      {
        system: 'Binary',
        values: {
          style: 'Grades',
          rules: [
            {
              value: 'Pass',
              gyan: 100
            },
            {
              value: 'Fail',
              gyan: 1
            }
          ]
        },
        description: 'Pass/Fail'
      }
    ];

  }

}

interface AssessmentResult {
  calendarId: string;
  assesserId: string;
  assesseeId: string;
  assessmentRuleId: string;
}

interface AssessmentTypeData {
  system: string;
  values: {
    style: string;
    rules?: Array<{
      value: string,
      gyan: number
    }>;
  };
  description: string;
}
