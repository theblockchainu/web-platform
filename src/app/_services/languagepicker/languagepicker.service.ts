import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import {environment} from '../../../environments/environment';

@Injectable()
export class LanguagePickerService {
    public envVariable;

    constructor(private http: HttpClient
        , private route: ActivatedRoute, public router: Router) {
        this.envVariable = environment;
    }

    public getLanguages() {

        return this.http.get(environment.apiUrl + '/api/languages')
            .map((response: any) => {
                return response;
            });
    }

}
