import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MediaUploaderService } from '../../mediaUploader/media-uploader.service';
import { MatSnackBar } from '@angular/material';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProfileService } from '../../profile/profile.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';

@Component({
	selector: 'app-verify-phone-dialog',
	templateUrl: './verify-phone-dialog.component.html',
	styleUrls: ['./verify-phone-dialog.component.scss']
})
export class VerifyPhoneDialogComponent implements OnInit {
	public step = 2;
	public peer: FormGroup;
	public otp: FormGroup;
	private phone: number;
	private success;
	public otpReceived: string;
	public userId;
	public profileId;
	private phone_numbers: any = [];
	
	constructor(
		public router: Router,
		private activatedRoute: ActivatedRoute,
		private mediaUploader: MediaUploaderService,
		private _fb: FormBuilder,
		public _profileService: ProfileService,
		private http: HttpClient,
		public snackBar: MatSnackBar,
		public dialogRef: MatDialogRef<VerifyPhoneDialogComponent>,
		public _cookieUtilsService: CookieUtilsService,
		@Inject(MAT_DIALOG_DATA) public data: any) {
		this.activatedRoute.params.subscribe(params => {
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.peer = this._fb.group({
			phone: ['', Validators.required],
			countryCode: ['', Validators.required]
		});
		
		this.otp = this._fb.group({
			inputOTP: [null]
		});
		const filter = {
			include: {
				profiles : 'phone_numbers'
			}
		};
		this._profileService.getPeerData(this.userId, filter)
			.subscribe((res) => {
				this.peer.controls.phone.setValue(res.profiles[0].phone_numbers[0].subscriber_number);
				this.peer.controls.countryCode.setValue(res.profiles[0].phone_numbers[0].country_code);
				this.profileId = res.profiles[0].id;
			});
	}
	
	continue(p) {
		this.step = p;
		
		if (p === 3) {
			const phone_number = {
				country_code: this.peer.controls.countryCode.value,
				subscriber_number: this.peer.controls.phone.value,
				isPrimary: true
			};
			this.phone_numbers.push(phone_number);
			this._profileService.updatePhoneNumbers(this.userId, this.profileId, this.phone_numbers).subscribe();
			this.sendOTP();
		}
	}
	
	public sendOTP() {
		this._profileService.sendVerifySms(this.peer.controls.phone.value, this.peer.controls.countryCode.value)
			.subscribe();
		console.log(this.phone);
		console.log('otp sent');
	}
	
	public resendOTP() {
		this._profileService.sendVerifySms(this.peer.controls.phone.value, this.peer.controls.countryCode.value)
			.subscribe((response) => {
				this.snackBar.open('Code sent again', 'OK', {
					duration: 2000
				});
			});
	}
	
	verifyPhone() {
		this._profileService.confirmSmsOTP(this.otp.controls['inputOTP'].value)
			.subscribe((res) => {
				console.log(res.phone);
				console.log('verified phone');
				this.success = res;
				this.dialogRef.close();
			}, err => {
				console.log(err);
			});
	}
}
