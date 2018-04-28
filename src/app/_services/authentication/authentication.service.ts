import { Injectable, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { SocketService } from '../socket/socket.service';
import { CookieUtilsService } from '../cookieUtils/cookie-utils.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthenticationService {
	@Output()
	getLoggedInUser: EventEmitter<any> = new EventEmitter();
	
	public key = 'access_token';
	public envVariable;
	private options;
	public userId;
	isLoginSubject = new BehaviorSubject<boolean>(this.hasToken());
	
	constructor(private http: HttpClient,
				private _cookieUtilsService: CookieUtilsService,
				private route: ActivatedRoute,
				public router: Router,
				public _requestHeaderService: RequestHeaderService,
				private _socketService: SocketService
	) {
		this.envVariable = environment;
		this.options = this._requestHeaderService.getOptions();
	}
	
	/**
	 *
	 * @returns {Observable<T>}
	 */
	isLoggedIn(): Observable<boolean> {
		return this.isLoginSubject.asObservable();
	}
	
	public getCookie(key: string) {
		return this._cookieUtilsService.getValue(key);
	}
	
	public setCookie(key: string, value: string) {
		this._cookieUtilsService.setValue(key, value);
	}
	
	public removeCookie(key: string) {
		this._cookieUtilsService.deleteValue(key);
	}
	
	/**
	 *  Login the user then tell all the subscribers about the new status
	 */
	login(email: string, password: string, rememberMe: boolean): any {
		const body = `{"email":"${email}","password":"${password}","rememberMe":${rememberMe}}`;
		return this.http
			.post(environment.apiUrl + '/auth/local', body, this.options)
			.map((response: any) => {
				console.log(response);
				// if res code is xxx and response "error"
				// login successful if there's a jwt token in the response
				const user = response;
				if (user && user.access_token) {
					this.isLoginSubject.next(true);
					this._socketService.addUser(user.userId);
					location.reload();
				}
			}, (err) => {
				console.log('Error: ' + err);
			});
	}
	
	/**
	 * Log out the user then tell all the subscribers about the new status
	 */
	logout(): void {
		console.log(this.route.toString());
		this.removeCookie(this.key);
		this.removeCookie('userId');
		this.removeCookie('accountApproved');
		this.removeCookie('access_token');
		this.isLoginSubject.next(false);
		this.getLoggedInUser.emit(0);
		if (this.getCookie(this.key)) {
			this.http.get(environment.apiUrl + '/auth/logout', this.options)
				.subscribe(
					(res: any) => {
						console.log('Logged out from server');
					}, err => {
						console.log(err);
					}
				);
		}
		this.router.navigate(['/']);
	}
	
	public broadcastNewUserId(userId) {
		this.getLoggedInUser.emit(userId);
	}
	
	/**
	 * if we have token the user is loggedIn
	 * @returns {boolean}
	 */
	private hasToken(): boolean {
		return !!this.getCookie(this.key);
	}
	
	sendForgotPwdMail(email): any {
		const body = `{"email":"${email}"}`;
		return this.http
			.post(environment.apiUrl + '/api/peers/forgotPassword?em=' + email, body, this.options)
			.map((response: any) => response, (err) => {
				console.log('Error: ' + err);
			});
	}
	
	sendEmailSubscriptions(email): any {
		const body = `{"email":"${email}"}`;
		return this.http
			.post(environment.apiUrl + '/api/emailSubscriptions?em=' + email, body, this.options)
			.map((response: any) => response, (err) => {
				console.log('Error: ' + err);
			});
	}
	
	resetPassword(body: any): any {
		return this.http
			.post(environment.apiUrl + '/api/peers/resetPassword', body, this.options)
			.map((response: any) => response);
	}
	createGuestContacts(first_name, last_name, email, subject, message): any {
		const body = `{"first_name":"${first_name}","last_name":"${last_name}",
    "email":"${email}","subject":"${subject}","message":"${message}"}`;
		return this.http
			.post(environment.apiUrl + '/api/guestContacts', body, this.options)
			.map((response: any) => response, (err) => {
				console.log('Error: ' + err);
			});
	}
}
