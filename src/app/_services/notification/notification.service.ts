import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class NotificationService {

    public key = 'userId';
    public now: Date;
    public envVariable;

    constructor(private http: HttpClient,
        private route: ActivatedRoute,
        public router: Router,
        private authService: AuthenticationService,
        private requestHeaderService: RequestHeaderService) {
        this.now = new Date();
        this.envVariable = environment;
    }

    public getNotifications(userId, options: any, cb) {
        if (userId) {
            this.http
                .get(environment.apiUrl + '/api/peers/' + userId + '/notifications?' + 'filter=' + options, this.requestHeaderService.options)
                .subscribe((response: any) => {
                    console.log(response);
                    cb(null, response);
                }, (err) => {
                    cb(err);
                });
        }
    }

    public updateNotification(userId, body: any, cb) {
        if (userId) {
            this.http
                .patch(environment.apiUrl + '/api/notifications/' + body.id, body, this.requestHeaderService.options)
                .subscribe((response: any) => {
                    console.log(response);
                    cb(null, response);
                }, (err) => {
                    cb(err);
                });
        }
    }



}
