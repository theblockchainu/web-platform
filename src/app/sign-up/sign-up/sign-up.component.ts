import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { SocketService } from '../../_services/socket/socket.service';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
import {environment} from '../../../environments/environment';
import {Meta, Title} from '@angular/platform-browser';

@Component({
	selector: 'app-sign-up',
	templateUrl: './sign-up.component.html',
	styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
	
	public startDate = new Date(1994, 0, 1);
	public signupForm: FormGroup;
	public hide = true;
	public emailRegister = false;
	public envVariable;
	constructor(private _fb: FormBuilder,
				private _router: Router,
				private _MatSnackBar: MatSnackBar,
				private _AuthenticationService: AuthenticationService,
				private _SocketService: SocketService,
				private titleService: Title,
				private metaService: Meta,
				private _RequestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
	}
	
	ngOnInit() {
		
		this.setTags();
		
		this.signupForm = this._fb.group({
			first_name: ['', Validators.required],
			last_name: ['', Validators.required],
			email: ['', Validators.email],
			password: ['', Validators.required],
			birthdate: ['', Validators.required]
		});
	}
	
	private setTags() {
		this.titleService.setTitle('Sign-up | Peerbuds');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Sign up for peerbuds.com'
		});
		this.metaService.updateTag({
			property: 'og:description',
			content: 'Peerbuds is an open decentralized protocol that tracks everything you have ever learned in units called Gyan and rewards it with tokens called Karma.'
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'peerbuds.com'
		});
		this.metaService.updateTag({
			property: 'og:image',
			content: 'https://peerbuds.com/pb_logo_square.png'
		});
		this.metaService.updateTag({
			property: 'og:url',
			content: environment.clientUrl + this._router.url
		});
	}
	
	signupEmail() {
		this.emailRegister = true;
	}
	
	submitForm() {
		console.log(this.signupForm);
		if (this.signupForm.valid) {
			const registerObject = this.signupForm.value;
			const birthdate = <Date>registerObject.birthdate;
			delete registerObject.birthdate;
			registerObject.dobDay = birthdate.getDay();
			registerObject.dobMonth = birthdate.getMonth();
			registerObject.dobYear = birthdate.getFullYear();
			this._AuthenticationService.signup(registerObject).subscribe((res: any) => {
				if (res.status === 'failed') {
					this._MatSnackBar.open(res.reason, 'Close', { duration: 5000 });
				} else {
					this.signIn();
				}
			}, err => {
				console.log(err);
				this.signIn();
			});
		}
	}
	
	signIn() {
		const userId = this._AuthenticationService.getCookie('userId');
		if (userId.length > 5) {
			this._RequestHeaderService.refreshToken.next(true);
			this._AuthenticationService.isLoginSubject.next(true);
			this._SocketService.addUser(userId);
			this._router.navigate(['verification', '1']);
		} else {
			this._MatSnackBar.open('An error occurred', 'close', { duration: 3000 });
		}
	}
	
	public openLogin() {
		this._router.navigate(['login']);
	}
	
	public back() {
		this.emailRegister = false;
	}
}
