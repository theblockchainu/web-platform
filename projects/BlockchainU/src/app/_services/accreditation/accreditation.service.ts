import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import {throwError} from 'rxjs/index';
import {catchError} from 'rxjs/internal/operators';

@Injectable()
export class AccreditationService {
	private userId: string;
	public key = 'userId';
	public envVariable;

	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		public router: Router,
		private authService: AuthenticationService,
		private requestHeaderService: RequestHeaderService,
		private _cookieUtilsService: CookieUtilsService
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}

	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			console.error('An error occurred:', error.error.message);
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong,
			console.error(
				`Backend returned code ${error.status}, ` +
				`body was: ${error.error}`);
		}
		// return an observable with a user-facing error message
		return throwError(
			'Something bad happened; please try again later.');
	}

	public createAccreditation(data: any) {
		return this.http.post(environment.apiUrl + '/api/peers/' + this.userId + '/accreditationsCreated', data, this.requestHeaderService.options)
			.pipe(
				catchError(this.handleError)
			);
	}

	public deleteAccreditation(accreditationId) {
		return this.http.delete(environment.apiUrl + '/api/accreditations/' + accreditationId, this.requestHeaderService.options)
			.pipe(
				catchError(this.handleError)
			);
	}

	public linkTopics(accreditationId, body) {
		return this.http.patch(environment.apiUrl + '/api/accreditations/' + accreditationId + '/topics/rel', body, this.requestHeaderService.options)
			.pipe(
				catchError(this.handleError)
			);
	}

	public fetchAccreditation(accreditationId: string, filter: any) {
		return this.http.get(environment.apiUrl + '/api/accreditations/' + accreditationId + '?filter=' + JSON.stringify(filter), this.requestHeaderService.options)
			.pipe(
				catchError(this.handleError)
			);
	}

	joinAccreditation(userId: string, accreditationId: string) {
		return this.http.put(environment.apiUrl + '/api/accreditations/' + accreditationId + '/subscribedBy/rel/' + userId, {}, this.requestHeaderService.options)
			.pipe(
				catchError(this.handleError)
			);
	}

	leaveAccreditation(userId: string, accreditationId: string) {
		return this.http.delete(environment.apiUrl + '/api/accreditations/' + accreditationId + '/subscribedBy/rel/' + userId, this.requestHeaderService.options)
			.pipe(
				catchError(this.handleError)
			);
	}

}
