import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const PHONE_REGEX = /^(\+\d{1,3}[- ]?)?\d{7,10}$/;
import { CountryPickerService } from '../../_services/countrypicker/countrypicker.service';
import {startWith, map} from 'rxjs/Operators';
import {Observable} from 'rxjs/Observable';

@Component({
	selector: 'upload-docs',
	templateUrl: './upload-docs.component.html',
	styleUrls: ['./upload-docs.component.scss']
})
export class UploadDocsComponent implements OnInit {
	public step = 1;
	public uploadingImage = false;
	public peer: FormGroup;
	public phoneOtp: FormGroup;
	public emailOtp: FormGroup;
	public emailForm: FormGroup;
	public phoneForm: FormGroup;
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

	constructor(
		public router: Router,
		private activatedRoute: ActivatedRoute,
		private mediaUploader: MediaUploaderService,
		private _fb: FormBuilder,
		public _profileService: ProfileService,
		private http: HttpClient,
		public snackBar: MatSnackBar,
		private dialog: MatDialog,
		private titleService: Title,
		private metaService: Meta,
		private dialogsService: DialogsService,
		private _cookieUtilsService: CookieUtilsService,
		private _RequestHeaderService: RequestHeaderService,
		private countryPickerService: CountryPickerService) {
		this.activatedRoute.params.subscribe(params => {
			this.step = parseInt(params['step'], 10);
		});
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}

	ngOnInit() {
		this.setTags();
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
			.subscribe((res) => {
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
					map(country =>  {
						console.log(country);
						return country ? this.filter(country) : this.countryCodes.slice();
					})
				);
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

	private setTags() {
		this.titleService.setTitle('Verification');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Peerbuds Verification'
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
			content: environment.clientUrl + this.router.url
		});
	}

	continue(p, isBack = false) {
		if (isBack) {
			this.step = p;
			this.router.navigate(['verification', +this.step]);
		} else {
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

	public sendEmailOTP(nextStep) {
		this.httpLoading = true;
		this._profileService.sendVerifyEmail(this.userId, this.emailForm.controls.email.value)
			.subscribe(response => {
				this.httpLoading = false;
				this.step = nextStep;
				this.router.navigate(['verification', +this.step]);
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
				this.router.navigate(['verification', +this.step]);
			}, err => {
				this.httpLoading = false;
				this.phoneFormError = err.error.error.message;
			}
			);
		console.log('sms sent');
	}


	public resendEmailOTP() {
		this.httpLoading = true;
		this._profileService.sendVerifyEmail(this.userId, this.emailForm.controls.email.value)
			.subscribe((response) => {
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
			.subscribe((response) => {
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
			.subscribe((response) => {
				console.log('File Saved Successfully');
			}, (err) => {
				console.log('Error updating Peer: ');
				console.log(err);
			});
	}

	verifyEmail(nextStep) {
		this.httpLoading = true;
		this._profileService.confirmEmail(this.userId, '' + this.emailOtp.controls['inputOTP'].value)
			.subscribe((res) => {
				this.httpLoading = false;
				this.success = res;
				this.step = nextStep;
				this.router.navigate(['invite', '1']);
				
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
			.subscribe((res) => {
				this.httpLoading = false;
				this.success = res;
				this.step = nextStep;
				this.router.navigate(['verification', +this.step]);
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

	redirectToOnboarding() {
		this.router.navigate(['/onboarding/1']);
	}

	uploadImage(event) {
		this.uploadingImage = true;
		console.log(event.files);
		for (const file of event.files) {
			this.mediaUploader.upload(file).map((responseObj) => {
				this.verificationIdUrl = responseObj.url;
				this.fileName = responseObj['originalFilename'];
				this.fileType = responseObj.type;
				this.peer.controls['verificationIdUrl'].setValue(responseObj.url);
				this.uploadingImage = false;
			}).subscribe();
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
	public openIdPolicy() {
		this.dialogsService.openIdPolicy().subscribe();
	}
	
	displayFn(country: CountryCode) {
		return country ? country.country : undefined;
	}
}

interface CountryCode {
	code: number;
	country: string;
}
