import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';

@Injectable()
export class LanguagePickerService {
    public envVariable;
    private options;
    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        public router: Router,
        private requestHeaderService: RequestHeaderService
    ) {
        this.envVariable = environment;
        this.options = this.requestHeaderService.getOptions();
    }

    public getLanguages() {

        return this.http.get(environment.apiUrl + '/api/languages', this.options)
            .map((response: any) => {
                return response;
            });
    }

    /**
     * addLanguage
     */
    public addLanguage(body: any) {
        return this.http.post(environment.apiUrl + '/api/languages', body, this.options);
    }

}
