import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../authentication/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ProfileService} from '../../profile/profile.service';
import {Meta, Title} from '@angular/platform-browser';
import {environment} from '../../../../environments/environment';
import {RequestHeaderService} from '../../requestHeader/request-header.service';
import {SocialSharingService} from '../../social-sharing/social-sharing.service';
import {SocketService} from '../../socket/socket.service';
import {LoginComponentDialog} from '../login-dialog/login-dialog.component';
declare var fbq: any;
@Component({
	selector: 'app-signup-dialog',
	templateUrl: './signup-dialog.component.html',
	styleUrls: ['./signup-dialog.component.scss']
})
export class SignupComponentDialogComponent implements OnInit {

	public startDate = new Date(1994, 0, 1);
	public signupForm: FormGroup;
	public hide = true;
	public emailRegister = false;
	public envVariable;
	private invitationId: string;
	public loading = false;
	invite: any;
	public invitor;

	constructor(
		public dialogRef: MatDialogRef<SignupComponentDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private _fb: FormBuilder,
		private _router: Router,
		private _MatSnackBar: MatSnackBar,
		private _AuthenticationService: AuthenticationService,
		private _SocketService: SocketService,
		private _profileService: ProfileService,
		private titleService: Title,
		private metaService: Meta,
		private _RequestHeaderService: RequestHeaderService,
		private activatedRoute: ActivatedRoute,
		private socialSharingService: SocialSharingService,
		private dialog: MatDialog
	) {
		this.envVariable = environment;
	}

	ngOnInit() {

		this.signupForm = this._fb.group({
			first_name: ['', Validators.required],
			last_name: ['', Validators.required],
			email: ['', Validators.email],
			password: ['', Validators.required],
			birthdate: [null]
		});

		this.activatedRoute.params.subscribe(params => {
			if (params['invitationId']) {
				this.invitationId = params['invitationId'];
				this.getInvitee();
			}
		});
	}

	private getInvitee() {
		const filter = {
			'include': ['contacts', { 'peers': 'profiles' }]
		};
		this.socialSharingService.getPeerInvite(this.invitationId, filter).subscribe((res: any) => {
			console.log(res);
			if (res) {
				this.invite = res;
			}
		}, err => {
			this._profileService.getPeerData(this.invitationId, { 'include': 'profiles' }).subscribe((res: any) => {
				console.log(res);
				if (res) {
					this.invitor = res;
				}
			});
		});
	}

	signupEmail() {
		this.emailRegister = true;
	}

	submitForm() {
		this.loading = true;
		console.log(this.signupForm);
		if (this.signupForm.valid) {
			const registerObject = this.signupForm.value;
			const birthdate = <Date>registerObject.birthdate;
			delete registerObject.birthdate;
			if (birthdate) {
				registerObject.dobDay = birthdate.getDate();
				registerObject.dobMonth = Number(birthdate.getMonth() + 1);
				registerObject.dobYear = birthdate.getFullYear();
				console.log(registerObject);
			}

			this._AuthenticationService.signup(registerObject).subscribe((res: any) => {
				if (res.status === 'failed') {
					this._MatSnackBar.open(res.reason, 'Close', { duration: 5000 });
					this.loading = false;
				} else {
					console.log('FB EVENTS: Complete Registration');
					try {
						if (fbq && fbq !== undefined) {
							fbq('track', 'CompleteRegistration', {
								currency: 'USD',
								value: 1.0,
								status: 'approved'
							});
						}
					} catch (e) {
						console.log(e);
					}
					this.signIn();
				}
			}, err => {
				console.log(err);
				try {
					if (fbq && fbq !== undefined) {
						fbq('track', 'CompleteRegistration', {
							currency: 'USD',
							value: 1.0,
							status: 'approved'
						});
					}
				} catch (e) {
					console.log(e);
				}
				this.signIn();
			});
		} else {
			this.loading = false;
		}
	}

	signIn() {
		const userId = this._AuthenticationService.getCookie('userId');
		if (userId.length > 5) {
			this._RequestHeaderService.refreshToken.next(true);
			this._AuthenticationService.isLoginSubject.next(true);
			this._SocketService.addUser(userId);
			this._router.navigate([this.data.returnTo]);
			this.loading = false;
			this.dialogRef.close();
		} else {
			this.loading = false;
			this._MatSnackBar.open('An error occurred', 'close', { duration: 3000 });
		}
	}

	public openLogin() {
		this.dialog.open(LoginComponentDialog, {
			panelClass: 'responsive-dialog'
		});
		this.dialogRef.close();
	}

	public back() {
		this.emailRegister = false;
	}

}
