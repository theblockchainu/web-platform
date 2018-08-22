import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import { MediaUploaderService } from '../../mediaUploader/media-uploader.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../profile/profile.service';
import { Meta, Title } from '@angular/platform-browser';
import { map, startWith } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { RequestHeaderService } from '../../requestHeader/request-header.service';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { CountryPickerService } from '../../countrypicker/countrypicker.service';
import { HttpClient } from '@angular/common/http';
import { PaymentService } from '../../payment/payment.service';
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const PHONE_REGEX = /^(\+\d{1,3}[- ]?)?\d{7,10}$/;

@Component({
	selector: 'app-onboarding-dialog',
	templateUrl: './onboarding-dialog.component.html',
	styleUrls: ['./onboarding-dialog.component.scss']
})
export class OnboardingDialogComponent implements OnInit {

	public step = 0;
	public uploadingImage = false;
	public peer: FormGroup;
	public phoneOtp: FormGroup;
	public emailOtp: FormGroup;
	public emailForm: FormGroup;
	public phoneForm: FormGroup;
	public loadingCountry = true;
	public userCountry;
	public success;
	public otpReceived: string;
	public verificationIdUrl: string;
	public fileType;
	public fileName;
	public userId;
	public emailOtpError: string;
	public phoneOtpError: string;
	public phoneFormError: string;
	public envVariable;
	public httpLoading = false;
	public countryCodes: Array<CountryCode>;
	public filteredCountryCodes: Observable<CountryCode[]>;
	public userIdentities: Array<any>;
	public passwordForm: FormGroup;

	constructor(
		public dialogRef: MatDialogRef<OnboardingDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public router: Router,
		private activatedRoute: ActivatedRoute,
		private mediaUploader: MediaUploaderService,
		private _fb: FormBuilder,
		public _profileService: ProfileService,
		public paymentService: PaymentService,
		private http: HttpClient,
		public snackBar: MatSnackBar,
		private dialog: MatDialog,
		private titleService: Title,
		private metaService: Meta,
		private _cookieUtilsService: CookieUtilsService,
		private _RequestHeaderService: RequestHeaderService,
		private countryPickerService: CountryPickerService
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}

	ngOnInit() {
		this.peer = this._fb.group({
			email: ['',
				[Validators.required,
				Validators.pattern(EMAIL_REGEX)]],
			verificationIdUrl: ['', Validators.required]
		});
		this.emailForm = this._fb.group({
			email: ['',
				[Validators.required,
				Validators.pattern(EMAIL_REGEX)]]
		});
		this.phoneForm = this._fb.group({
			countryCode: ['', [Validators.required]],
			phone: ['',
				[Validators.required,
				Validators.pattern(PHONE_REGEX)]]
		});
		this.phoneForm.disable();
		this.emailOtp = this._fb.group({
			inputOTP: [null, [Validators.required]]
		});
		this.phoneOtp = this._fb.group({
			inputOTP: [null, [Validators.required]]
		});
		this._profileService.getPeerNode(this.userId)
			.subscribe((res: any) => {
				if (res.email && res.email.length > 0) {
					this.emailForm.controls.email.setValue(res.email);
					this.emailForm.controls.email.disable();
				}
			});
		this.countryCodes = [];
		this.countryPickerService.getCountries().subscribe((res: any) => {
			res.forEach(country => {
				this.countryCodes.push({
					code: country.callingCode[0],
					country: country.name
				});
			});
			this.phoneForm.enable();
			this.filteredCountryCodes = this.phoneForm.controls.countryCode.valueChanges
				.pipe(
					startWith<string | CountryCode>(''),
					map(value => {
						console.log(value);
						return typeof value === 'string' ? value : value.country;
					}),
					map(country => {
						console.log(country);
						return country ? this.filter(country) : this.countryCodes.slice();
					})
				);
		});
		this.passwordForm = this._fb.group({
			password: ['', Validators.required],
			confirmPassword: ['', Validators.required],

		});
		this.getUserProfile();
		this.getUserCountry();
		this.getIdentities();
	}


	private getIdentities() {
		this.userIdentities = [];
		const filter = {
			include: ['identities']
		};
		this._profileService.getPeerData(this.userId, filter).subscribe(res => {
			this.userIdentities = res.identities;
		});
	}

	private getUserProfile() {
		this._profileService.getPeerData(this.userId).subscribe(res => {
			if (res && res.phoneVerified) {
				this.sendEmailOTP(4);
			}
		});
	}

	filter(country: string): CountryCode[] {
		return this.countryCodes.filter(option => {
			if (option.country.toLowerCase().indexOf(country.toLowerCase()) === 0) {
				console.log('Matched');
			}
			return option.country.toLowerCase().indexOf(country.toLowerCase()) === 0;
		});
	}


	continue(p, isBack = false) {
		if (isBack) {
			this.step = p;
		} else {
			if (p === 1) {
				if (this.userIdentities.length > 0) {
					this.step = 6;
				} else {
					this.step = 1;
				}
			}
			if (p === 2) {
				this.sendPhoneOTP(p);
			}
			if (p === 3) {
				this.verifyPhone(p);
			}
			if (p === 4) {
				this.sendEmailOTP(p);
			}
			if (p === 5) {
				this.verifyEmail(p);
			}
		}
	}

	public submitPassword() {
		this.httpLoading = true;
		if (this.passwordForm.value.password === this.passwordForm.value.confirmPassword) {
			this._profileService.setPassword(this.userId, this.passwordForm.value.password).subscribe(res => {
				this.step = 1;
				this.httpLoading = false;
			}, err => {
				console.log(err);
				this.httpLoading = false;
				this.snackBar.open('Error in setting password', 'Close', { duration: 3000 });
			});
		} else {
			this.httpLoading = false;
			this.snackBar.open('The passwords no not match', 'Close', { duration: 3000 });
		}
	}

	public sendEmailOTP(nextStep) {
		this.httpLoading = true;
		this._profileService.sendVerifyEmail(this.userId, this.emailForm.controls.email.value)
			.subscribe(response => {
				this.httpLoading = false;
				this.step = nextStep;
			}, err => {
				this.httpLoading = false;
				this.snackBar.open('Error sending code to your email. Try again.', 'OK', {
					duration: 5000
				});
			});
		console.log('mail sent');
	}

	public sendPhoneOTP(nextStep) {
		this.httpLoading = true;
		this.phoneFormError = null;
		this._profileService.sendVerifySms(this.phoneForm.controls.phone.value, this.phoneForm.controls.countryCode.value.code)
			.subscribe(response => {
				this.httpLoading = false;
				this.step = nextStep;
			}, err => {
				this.httpLoading = false;
				console.log(err);
				if (err && err.error && err.error.error && err.error.error.message) {
					this.phoneFormError = err.error.error.message;
				} else {
					this.snackBar.open('An error occurred', 'Retry?', {
						duration: 3000
					}).onAction().subscribe(res => {
						this.sendPhoneOTP(nextStep);
					});
				}
			}
			);
		console.log('sms sent');
	}


	public resendEmailOTP() {
		this.httpLoading = true;
		this._profileService.sendVerifyEmail(this.userId, this.emailForm.controls.email.value)
			.subscribe((response: any) => {
				this.httpLoading = false;
				this.snackBar.open('Code Resent', 'OK', {
					duration: 5000
				});
			}, err => {
				this.httpLoading = false;
				this.snackBar.open('Error sending code to your email. Try again.', 'OK', {
					duration: 5000
				});
			});
	}

	public resendPhoneOTP() {
		this.httpLoading = true;
		this._profileService.sendVerifySms(this.phoneForm.controls.phone.value, this.phoneForm.controls.countryCode.value.code)
			.subscribe((response: any) => {
				this.httpLoading = false;
				this.snackBar.open('Code Resent', 'OK', {
					duration: 5000
				});
			}, err => {
				this.httpLoading = false;
				this.snackBar.open(err.error.error.message, 'OK', {
					duration: 5000
				});
			});
	}

	updatePeer() {
		this._profileService
			.updatePeer(this.userId, {
				'verificationIdUrl': this.peer.controls['verificationIdUrl'].value,
				'email': this.peer.controls['email'].value
			})
			.subscribe((response: any) => {
				console.log('File Saved Successfully');
			}, (err) => {
				console.log('Error updating Peer: ');
				console.log(err);
			});
	}

	verifyEmail(nextStep) {
		this.httpLoading = true;
		this._profileService.confirmEmail(this.userId, '' + this.emailOtp.controls['inputOTP'].value)
			.subscribe((res: any) => {
				this.httpLoading = false;
				this.success = res;
				this.step = nextStep;
			},
				(err) => {
					this.httpLoading = false;
					console.log(err);
					if (err.status === 400) {
						this.emailOtpError = 'The code you entered does not match our records. Did you enter the most recent one?';
					}

				}
			);
	}

	verifyPhone(nextStep) {
		this.httpLoading = true;
		this._profileService.confirmSmsOTP('' + this.phoneOtp.controls['inputOTP'].value)
			.subscribe((res: any) => {
				this.httpLoading = false;
				this.success = res;
				this.sendEmailOTP(nextStep + 1);
			},
				(err) => {
					console.log(err);
					this.httpLoading = false;
					if (err.status === 400) {
						this.phoneOtpError = 'The code you entered does not match our records. Did you enter the most recent one?';
					}

				}
			);
	}

	public redirectToOnboarding() {
		this.router.navigate(['/onboarding/1']);
	}

	uploadImage(event) {
		this.uploadingImage = true;
		console.log(event.files);
		for (const file of event.files) {
			this.mediaUploader.upload(file).subscribe((responseObj: any) => {
				this.verificationIdUrl = responseObj.url;
				this.fileName = responseObj['originalFilename'];
				this.fileType = responseObj.type;
				this.peer.controls['verificationIdUrl'].setValue(responseObj.url);
				this.uploadingImage = false;
			});
		}
	}

	deleteFromContainer(url: string, type: string) {
		if (type === 'image' || type === 'file') {
			this._profileService.updatePeer(this.userId, {
				'verificationIdUrl': ''
			}).subscribe((response: any) => {
				this.verificationIdUrl = response.picture_url;
			});
		} else {
			console.log('error');
		}
	}

	displayFn(country: CountryCode) {
		return country ? country.country : undefined;
	}

	public skipOnboarding() {
		this.dialogRef.close('false');
	}

	public closeOnboarding() {
		this.dialogRef.close('true');
	}

	private getUserCountry() {
		this.loadingCountry = true;
		this.paymentService.getUserCountry().subscribe(res => {
			this.userCountry = res['countryCode'];
			this.phoneForm.controls.countryCode.patchValue(res['country']);
			console.log(res);
			this.loadingCountry = false;
		}, err => {
			console.log(err);
			this.loadingCountry = false;
		});
	}

}

interface CountryCode {
	code: number;
	country: string;
}
