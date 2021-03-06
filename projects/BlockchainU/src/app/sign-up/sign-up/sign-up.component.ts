import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { SocketService } from '../../_services/socket/socket.service';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { SocialSharingService } from '../../_services/social-sharing/social-sharing.service';
import { ProfileService } from '../../_services/profile/profile.service';
declare var fbq: any;

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
	private invitationId: string;
	public loading = false;
	invite: any;
	public invitor;

	constructor(
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
		private socialSharingService: SocialSharingService
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
			birthdate: [null, Validators.required]
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

	private setTags() {
		this.titleService.setTitle('Sign-up | The Blockchain University');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Join Blockchain University'
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'theblockchainu.com'
		});
		this.metaService.updateTag({
			property: 'og:description',
			content: 'Blockchain University is the world\'s largest Blockchain Education company.'
		});
		this.metaService.updateTag({
			property: 'og:image',
			content: 'https://theblockchainu.com/bu_logo_square.png'
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
			}
			console.log(registerObject);

			this._AuthenticationService.signup(registerObject).subscribe((res: any) => {
				if (res.status === 'failed') {
					this._MatSnackBar.open(res.reason, 'Close', { duration: 5000 });
				} else {
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
		}
	}

	signIn() {
		const userId = this._AuthenticationService.getCookie('userId');
		if (userId.length > 5) {
			this._RequestHeaderService.refreshToken.next(true);
			this._AuthenticationService.isLoginSubject.next(true);
			this._SocketService.addUser(userId);
			this.loading = false;
			this._router.navigate(['invite', '1']);
		} else {
			this.loading = false;
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
