import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {environment} from '../../environments/environment';
@Component({
    selector: 'app-error',
    templateUrl: './error-handler.component.html',
    styleUrls: ['./error-handler.component.scss']
})

@Injectable()
export class GlobalErrorHandlerComponent implements ErrorHandler {
    public envVariable;
    constructor(private injector: Injector) {
        this.envVariable = environment;
    }
    handleError(error) {
        const router = this.injector.get(Router);
        const message = error.message ? error.message : error.toString();
        // location.reload();
        // TODO: log on the server
        router.navigate(['error']);
        throw error;
    }
}
