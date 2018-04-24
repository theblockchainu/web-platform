import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import { ProfileService } from '../_services/profile/profile.service';
import 'rxjs/add/operator/map';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';

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
	
	constructor(public profileService: ProfileService,
				private _fb: FormBuilder,
				public router: Router,
				private _cookieUtilsService: CookieUtilsService) {
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
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
			// var element = array[index];
			this.dobYear.push(index);
		}
		
		for (let index = 1; index <= 31; index++) {
			// var element = array[index];
			this.dobDay.push(index);
		}
	}
	
	continueWithSocialSignup(signupSocialForm) {
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
		
		this.router.navigate(['app-upload-docs', '1']);
		
	}
	
}
