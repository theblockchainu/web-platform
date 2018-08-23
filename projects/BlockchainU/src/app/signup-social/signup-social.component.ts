import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../_services/profile/profile.service';

import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material';
import { WalletService } from '../_services/wallet/wallet.service';
import { AuthenticationService } from '../_services/authentication/authentication.service';
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
	selector: 'app-signup-social',
	templateUrl: './signup-social.component.html',
	styleUrls: ['./signup-social.component.scss']
})
export class SignupSocialComponent implements OnInit {

	public userId;
	public peerProfile: any = {};
	public presentYear: any = new Date().getFullYear();
	public maxYear = this.presentYear;
	public periodStarts = (this.presentYear - 100);
	public period = 100;
	public dobYear: any = [];
	public dobDay: any = [];
	public promoOptIn = false;
	public signupSocialForm: FormGroup;
	public selectedDay;
	public selectedMonth;
	public selectedYear;
	public dob: string;
	public showPasswordForm: boolean;
	public passwordForm: FormGroup;

	constructor(public profileService: ProfileService,
		private _fb: FormBuilder,
		public router: Router,
		private titleService: Title,
		private metaService: Meta,
		private _cookieUtilsService: CookieUtilsService,
		private snackbar: MatSnackBar,
		private _walletService: WalletService,
		private authService: AuthenticationService) {
		this.userId = _cookieUtilsService.getValue('userId');
	}

	ngOnInit() {
		this.setTags();
		this.getPeerData();
		this.getPeerWithProfile();
		this.loadMonthAndYear();

		this.signupSocialForm = this._fb.group({
			first_name: ['', [Validators.required]],
			last_name: ['', [Validators.required]],
			email: ['',
				[Validators.required,
				Validators.pattern(EMAIL_REGEX)]],
			dobMonth: [null, [Validators.required]],
			dobDay: [null, [Validators.required]],
			dobYear: [null, [Validators.required]]
		});
		this.showPasswordForm = false;
		this.passwordForm = this._fb.group({
			newPassword: ['', [Validators.required]],
			confirmPassword: ['', [Validators.required]]
		});

	}

	private setTags() {
		this.titleService.setTitle('Onboarding');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Peerbuds Onboarding'
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
			content: environment.clientUrl + this.router.url
		});
	}

	getPeerData() {
		this.profileService.getPeerData(this.userId).subscribe(peer => {
			if (peer.email) {
				this.signupSocialForm.controls.email.patchValue(peer.email);
				this.signupSocialForm.controls.email.disable();
			}
		});
	}

	getPeerWithProfile() {
		const query = {};
		this.profileService.getProfileData(this.userId, query).subscribe((peerProfile) => {
			this.peerProfile = peerProfile[0];

			this.signupSocialForm.controls.dobDay.patchValue(peerProfile[0].dobDay);
			this.signupSocialForm.controls.dobMonth.patchValue(peerProfile[0].dobMonth);
			this.signupSocialForm.controls.dobYear.patchValue(peerProfile[0].dobYear);

			this.signupSocialForm.controls.first_name.patchValue(peerProfile[0].first_name);
			if (peerProfile[0].first_name && peerProfile[0].first_name.length > 0) {
				this.signupSocialForm.controls.first_name.disable();
			}
			this.signupSocialForm.controls.last_name.patchValue(peerProfile[0].last_name);
			if (peerProfile[0].last_name && peerProfile[0].last_name.length > 0) {
				this.signupSocialForm.controls.last_name.disable();
			}
		});
	}

	// Load month and year
	loadMonthAndYear() {
		for (let index = this.maxYear; index >= this.periodStarts; index--) {
			this.dobYear.push(index);
		}

		for (let index = 1; index <= 31; index++) {
			this.dobDay.push(index);
		}
	}

	continueWithSocialSignup() {
		console.log(this.signupSocialForm.value);
		const email = { email: this.signupSocialForm.value.email };
		const profile = {
			first_name: this.signupSocialForm.value.first_name,
			last_name: this.signupSocialForm.value.last_name,
			dobMonth: this.signupSocialForm.value.dobMonth,
			dobDay: this.signupSocialForm.value.dobDay,
			dobYear: this.signupSocialForm.value.dobYear
		};
		this.profileService.updatePeer(this.userId, email).subscribe();
		this.profileService.updatePeerProfile(this.userId, profile).subscribe((response: any) => response);
		this.showPasswordForm = true;
	}

	submitPassword() {
		if (this.passwordForm.valid && this.passwordForm.value.newPassword === this.passwordForm.value.confirmPassword) {
			this.profileService.setPassword(this.userId, this.passwordForm.value.newPassword)
				.subscribe(res => {
					this.snackbar.open('Password Changed now creating wallet...', '', { duration: 2000 });
					this.fixWallet(this.passwordForm.value.newPassword);
				}, err => {
					this.snackbar.open(err, '', { duration: 2000 });
				});
		}
	}

	fixWallet(password) {
		const passwordObj = {
			password: password
		};
		this._walletService.fixWallet(this.userId, passwordObj)
			.subscribe((result: any) => {
				this.snackbar.open('Successfully updated wallet. Redirecting...', 'Ok', { duration: 5000 });
				this.authService.isLoginSubject.next(true);
				this.router.navigate(['verification', '1']);
			},
				error => {
					this.snackbar.open('Error fixing wallet: ' + error.error.error.message, 'Close', { duration: 5000 });
				});
	}
}
