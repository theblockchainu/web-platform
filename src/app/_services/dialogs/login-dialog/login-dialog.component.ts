import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../alert/alert.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { Observable } from 'rxjs/Observable';
import {
	FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogConfig } from '@angular/material';
import { RequestPasswordDialogComponent } from '../forgot-pwd-dialog/forgot-pwd-dialog.component';
import {environment} from '../../../../environments/environment';

@Component({
	selector: 'app-login-dialog',  // <login></login>
	providers: [],
	// Our list of styles in our component. We may add more to compose many styles together
	styleUrls: ['./login-dialog.component.scss'],
	// Every Angular template is first compiled by the browser before Angular runs it's compiler
	templateUrl: './login-dialog.component.html'
})

// tslint:disable-next-line:component-class-suffix
export class LoginComponentDialog implements OnInit {
	// Set our default values
	// public loading = false;
	isLoggedIn: Observable<boolean>;
	private email: string;
	public passWord: string;
	public rememberMe = false;
	public loginForm: FormGroup;
	public forgotpwdForm: FormGroup;
	// TypeScript public modifiers
	public isChecked = false;
	public showError = false;
	public envVariable;
	public loadingHttp = false;
	
	constructor(
		private route: ActivatedRoute,
		public router: Router,
		private dialog: MatDialog,
		public authenticationService: AuthenticationService,
		private alertService: AlertService,
		public dialogRef: MatDialogRef<LoginComponentDialog>,
		private _fb: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.envVariable = environment;
		this.isLoggedIn = this.authenticationService.isLoggedIn();
	}
	
	public ngOnInit() {
		// reset login status
		// get return url from route parameters or default to '/'
		this.loginForm = this._fb.group({
			email: ['', Validators.email], /* putting reg ex as well */
			password: ['', Validators.required],
			rememberMe: [false]
		});
		this.forgotpwdForm = this._fb.group({
			email: ['', Validators.email] /* putting reg ex as well */
		});
	}
	
	public toggle() {
		this.isChecked = !(this.isChecked);
	}
	
	public login() {
		this.email = this.loginForm.controls['email'].value;
		this.passWord = this.loginForm.controls['password'].value;
		this.rememberMe = this.loginForm.controls['rememberMe'].value;
		this.authenticationService.login(this.email, this.passWord, this.rememberMe)
			.subscribe(
				(data) => {
					this.dialogRef.close();
				},
				(error) => {
					if (error.status === 401 || error._body === '"authentication error"') {
						this.alertService.error(error._body);
						this.showError = true;
					} else { console.log(error); }
				});
	}
	public openForgotPwd() {
		const dialogRef = this.dialog.open(RequestPasswordDialogComponent, {});
		return dialogRef.afterClosed();
	}
	onNoClick(): void {
		this.dialogRef.close();
	}
}
