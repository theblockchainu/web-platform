import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../_services/alert/alert.service';
import { AuthenticationService } from '../_services/authentication/authentication.service';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import {environment} from '../../environments/environment';
import {DialogsService} from '../_services/dialogs/dialog.service';

@Component({
	selector: 'app-login',  // <login></login>
	providers: [],
	// Our list of styles in our component. We may add more to compose many styles together
	styleUrls: ['./login.component.scss'],
	// Every Angular template is first compiled by the browser before Angular runs it's compiler
	templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
	// Set our default values
	public model: any = {};
	public loading = false;
	public returnUrl: string;
	isLoggedIn: Observable<boolean>;
	public rememberMe: boolean;
	public email: string;
	public passWord: string;
	public envVariable;
	// TypeScript public modifiers
	
	public loginForm = new FormGroup({
		email: new FormControl(null, [Validators.required, Validators.pattern('^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$')]), /* putting reg ex as well */
		password: new FormControl(null, Validators.required)
	});
	
	constructor(
		private route: ActivatedRoute,
		public router: Router,
		public authenticationService: AuthenticationService,
		private alertService: AlertService,
		private dialogsService: DialogsService,
		private _fb: FormBuilder) {
		this.envVariable = environment;
		this.isLoggedIn = this.authenticationService.isLoggedIn();
	}
	
	public ngOnInit() {
		// get return url from route parameters or default to '/'
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
	}
	
	public login() {
		this.loading = true;
		this.email = this.loginForm.controls['email'].value;
		this.passWord = this.loginForm.controls['password'].value;
		this.rememberMe = this.loginForm.controls['this.rememberMe'].value;
		this.authenticationService.login(this.email, this.passWord, this.rememberMe)
			.subscribe(
				(data) => {
					this.router.navigate([this.returnUrl]);
				},
				(error) => {
					this.alertService.error(error._body);
					this.loading = false;
				});
	}
	
	private redirect() {
		this.router.navigate([this.returnUrl]); // use the stored url here
	}
	
	public getpwd() {
		// do nothing
	}
	
	public openSignup() {
		this.dialogsService.openSignup('invite/1').subscribe();
	}
}
