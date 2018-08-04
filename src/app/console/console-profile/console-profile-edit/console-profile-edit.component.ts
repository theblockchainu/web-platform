import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleProfileComponent } from '../console-profile.component';
import { ProfileService } from '../../../_services/profile/profile.service';
import { LanguagePickerService } from '../../../_services/languagepicker/languagepicker.service';
import { CurrencyPickerService } from '../../../_services/currencypicker/currencypicker.service';
import { TimezonePickerService } from '../../../_services/timezone-picker/timezone-picker.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';

import { UcFirstPipe } from 'ngx-pipes';
import * as _ from 'lodash';

declare var moment: any;

@Component({
	selector: 'app-console-profile-edit',
	templateUrl: './console-profile-edit.component.html',
	styleUrls: ['./console-profile-edit.component.scss', '../../console.component.scss'],
	providers: [UcFirstPipe]
})
export class ConsoleProfileEditComponent implements OnInit {
	public loadingProfile = false;
	public busyUpdate = false;
	public userId;
	public profile: any;
	public peer: any;
	public work: any;
	public education: any;
	public months: any[];
	public days: any[];
	public years: any[];
	public languages: any[];
	public language: Observable<any[]>;
	private languagesAsync: BehaviorSubject<any[]>;
	public currencies: any[];
	private currenciesAsync: BehaviorSubject<any[]>;
	public timezones: any[];
	private timezoneAsync: BehaviorSubject<any[]>;
	public profileForm: FormGroup;
	public filteredOptions: Observable<any[]>;
	public filteredCurrencies: Observable<any[]>;
	public filteredTimezones: Observable<any[]>;
	public disableEndDate = false;
	public disableEndYearBool = false;

	// Geo Location
	public userSettings: any = {
		geoLocation: [37.76999, -122.44696],
		geoRadius: 5,
		inputPlaceholderText: 'Where do you live',
		showSearchButton: false,
	};
	public componentData6: any = '';

	constructor(
		public activatedRoute: ActivatedRoute,
		public consoleProfileComponent: ConsoleProfileComponent,
		public router: Router,
		public _profileService: ProfileService,
		public _languageService: LanguagePickerService,
		public _currencyService: CurrencyPickerService,
		public snackBar: MatSnackBar,
		public _fb: FormBuilder,
		public _timezoneService: TimezonePickerService,
		private http: HttpClient,
		private _cookieUtilsService: CookieUtilsService,
		private ucFirstPipe: UcFirstPipe) {
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			if (urlSegment[0] === undefined) {
				consoleProfileComponent.setActiveTab('edit');
			} else {
				consoleProfileComponent.setActiveTab(urlSegment[0].path);
			}
		});
		this.languagesAsync = <BehaviorSubject<any[]>>new BehaviorSubject([]);
		this.language = this.languagesAsync.asObservable();
		this.currenciesAsync = <BehaviorSubject<any[]>>new BehaviorSubject([]);
		this.timezoneAsync = <BehaviorSubject<any[]>>new BehaviorSubject([]);

		this.userId = _cookieUtilsService.getValue('userId');
	}

	ngOnInit() {
		this.loadingProfile = true;
		this.profileForm = this._fb.group(
			{
				first_name: ['', Validators.requiredTrue],
				last_name: '',
				headline: '',
				preferred_language: '',
				other_languages: this._fb.array(['']),
				currency: '',
				gender: '',
				timezone: '',
				dobMonth: '',
				dobYear: '',
				dobDay: '',
				location_string: '',
				location_lat: '',
				location_lng: '',
				portfolio_url: '',
				description: '',
				phone_numbers: this._fb.array([this.initializePhone('', '', true)]),
				vat_number: '',
				emergency_contacts: this._fb.array([this.initializeEmergencyContact()]),
				education: this._fb.array([
					this.initializeEducationForm()
				]),
				work: this._fb.array([
					this.initializeWorkForm()
				]),
				email: { value: '', disabled: true }
			}
		);
		this.getLanguages();
		this.getCurrencies();
		this.getTimezones();
		const query = {
			'include': [
				'education',
				'work',
				'peer',
				'phone_numbers',
				'emergency_contacts'
			]
		};
		this._profileService.getProfileData(this.userId, query).subscribe((profiles) => {
			console.log(profiles);
			this.setFormValues(profiles);
		});

		this._profileService.getProfile(this.userId).subscribe((profiles) => {
			this.profile = profiles[0];
			if (this.profile.work !== undefined && this.profile.work.length === 0) {
				const workEntry = {};
				this.profile.work.push(workEntry);
			}
			if (this.profile.education !== undefined && this.profile.education.length === 0) {
				const educationEntry = {};
				this.profile.education.push(educationEntry);
			}
			this.loadingProfile = false;
			// this.months = moment.months();
			this.days = this.getDaysArray();
			this.years = this.getYearsArray();
		});
	}

	toggleEndDate() {
		this.disableEndDate = !this.disableEndDate;
	}

	disableEndYear() {
		this.disableEndYearBool = !this.disableEndYearBool;
	}

	autoCompleteCallback(callbackData: any): any {
		if (callbackData.response) {
			const data = callbackData.data;
			this.profileForm.controls['location_string'].patchValue(data.name);
			this.profileForm.controls['location_lat'].patchValue(Number(data.geometry.location.lat));
			this.profileForm.controls['location_lng'].patchValue(Number(data.geometry.location.lng));
		}
	}

	getLanguages() {
		this._languageService.getLanguages().subscribe(data => {
			this.languages = data;
			this.languagesAsync.next(this.languages);
			this.profileForm.controls['preferred_language'].valueChanges
				.startWith(null)
				.subscribe(val => {
					if (val) {
						this.filteredOptions = _.filter(this.languages, (item) => {
							return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
						});
					} else {
						this.languages.slice();
					}
					// console.log(this.filteredOptions);
				}
				);
		}, error => console.log('Could not load languages.'));
	}

	getCurrencies() {
		this._currencyService.getCurrencies().subscribe((currencies: any) => {
			this.currencies = currencies;
			this.currenciesAsync.next(this.currencies);
			this.profileForm.controls['currency'].valueChanges
				.startWith(null)
				.subscribe(val => {
					if (val) {
						this.filteredCurrencies = _.filter(this.currencies, (item) => {
							return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
						});
					} else {
						this.currencies.slice();
					}
				}
				);
		}, error => console.log('Could not load currencies'));

	}

	getTimezones() {
		const filter = `{  "order": "offset ASC" }`;
		this._timezoneService.getTimezones(filter).subscribe(timezones => {
			this.timezones = timezones;
			this.timezoneAsync.next(this.timezones);
			this.profileForm.controls['timezone'].valueChanges
				.startWith(null)
				.subscribe(val => {
					if (val) {
						this.filteredTimezones = _.filter(this.timezones, (item) => {
							return item.text.toLowerCase().indexOf(val.toLowerCase()) > -1;
						});
					} else {
						this.timezones.slice();
					}
				}
				);
		}, error => console.log('Could not load timezones'));
	}

	private setFormValues(profiles: Array<any>) {
		if (profiles.length > 0) {
			this.profileForm.patchValue(profiles[0]);
			this.profileForm.controls['dobDay'].patchValue(profiles[0].dobDay);
			this.profileForm.controls['dobMonth'].patchValue(profiles[0].dobMonth);
			this.profileForm.controls['dobYear'].patchValue(profiles[0].dobYear);
			this.profileForm.controls['email'].patchValue(profiles[0].peer[0].email);
			if (profiles[0].location_string) {
				this.userSettings['inputString'] = profiles[0].location_string;
			}
			if (profiles[0].location_lat && profiles[0].location_lng) {
				this.profileForm.controls['location_lat'].patchValue(Number(profiles[0].location_lat));
				this.profileForm.controls['location_lng'].patchValue(Number(profiles[0].location_lng));
				this.userSettings.geoLocation = [profiles[0].location_lat, profiles[0].location_lng];
			}
			if (profiles[0].other_languages && profiles[0].other_languages.length > 0) {
				this.profileForm.setControl('other_languages', this._fb.array(
					profiles[0].other_languages
				));
			}
			this.userSettings = Object.assign({}, this.userSettings);

			if (profiles[0].emergency_contacts && profiles[0].emergency_contacts.length > 0) {
				this.profileForm.setControl('emergency_contacts', this._fb.array([]));
				const ec_Array = <FormArray>this.profileForm.controls['emergency_contacts'];
				profiles[0].emergency_contacts.forEach(ecObj => {
					ec_Array.push(
						this._fb.group({
							country_code: [ecObj.country_code, Validators.requiredTrue],
							subscriber_number: [ecObj.subscriber_number, Validators.requiredTrue]
						})
					);
				});
			}
			if (profiles[0].phone_numbers && profiles[0].phone_numbers.length > 0) {
				this.profileForm.setControl('phone_numbers', this._fb.array([]));
				const ph_Array = <FormArray>this.profileForm.controls['phone_numbers'];
				profiles[0].phone_numbers.forEach(phObj => {
					let isPrimary = true;
					if (phObj.isPrimary === false) {
						isPrimary = false;
					}
					ph_Array.push(
						this._fb.group({
							country_code: [phObj.country_code, Validators.requiredTrue],
							subscriber_number: [phObj.subscriber_number, Validators.requiredTrue],
							isPrimary: [isPrimary]
						})
					);
				});
			}
			if (profiles[0].work && profiles[0].work.length > 0) {
				this.profileForm.setControl('work', this._fb.array([]));
				const workArray = <FormArray>this.profileForm.controls['work'];
				profiles[0].work.forEach(workObj => {
					workArray.push(
						this._fb.group({
							position: [workObj.position, Validators.requiredTrue],
							company: [workObj.company, Validators.requiredTrue],
							startDate: [moment(workObj.startDate).local().toDate(), Validators.requiredTrue],
							endDate: [workObj.endDate ? moment(workObj.endDate).local().toDate() : null, Validators.requiredTrue],
							presentlyWorking: [workObj.presentlyWorking]
						})
					);
				});
			}
			if (profiles[0].education && profiles[0].education.length > 0) {
				this.profileForm.setControl('education', this._fb.array([]));
				const educationArray = <FormArray>this.profileForm.controls['education'];
				profiles[0].education.forEach(educationObj => {
					educationArray.push(
						this._fb.group({
							degree: educationObj.degree,
							school: educationObj.school,
							startYear: parseInt(educationObj.startYear, 10),
							endYear: parseInt(educationObj.endYear, 10),
							presentlyPursuing: [educationObj.presentlyPursuing]
						})
					);
				});
			}
		}
	}

	private initializeWorkForm(): FormGroup {
		return this._fb.group({
			position: ['', Validators.requiredTrue],
			company: ['', Validators.requiredTrue],
			startDate: [null, Validators.requiredTrue],
			endDate: [null, Validators.requiredTrue],
			presentlyWorking: false
		});
	}

	private initializeEducationForm(): FormGroup {
		return this._fb.group({
			degree: '',
			school: '',
			startYear: '',
			endYear: '',
			presentlyPursuing: false
		});
	}

	private initializePhone(code, number, isPrimary): FormGroup {
		return this._fb.group({
			country_code: [code, Validators.required],
			subscriber_number: [number, Validators.required],
			isPrimary: isPrimary
		});
	}

	private initializeEmergencyContact(): FormGroup {
		return this._fb.group({
			country_code: ['', Validators.required],
			subscriber_number: ['', Validators.required]
		});
	}



	/**
	 * Get array of days
	 * @returns {Array}
	 */
	public getDaysArray() {
		const days = [];
		for (let i = 1; i <= 30; i++) {
			days.push(i);
		}
		return days;
	}

	/**
	 * Get array of days
	 * @returns {Array}
	 */
	public getYearsArray() {
		const years = [];
		for (let i = moment().year(); i >= 1917; i--) {
			years.push(i);
		}
		return years;
	}

	/**
	 * saveProfile
	 */
	public saveProfile() {
		const profileData = this.profileForm.value;
		// delete profileData.education.presentlyPursuing;
		const education = profileData.education;
		delete profileData.education;
		// delete profileData.work.presentlyWorking;
		const work = profileData.work;
		delete profileData.work;
		const email = profileData.email;
		delete profileData.email;
		const phone_numbers = profileData.phone_numbers;
		delete profileData.phone_numbers;
		const emergency_contacts = profileData.emergency_contacts;
		delete profileData.emergency_contact;
		// profileData = this.sanitize(profileData);
		console.log(email);
		// console.log(phone_numbers);
		this.busyUpdate = true;
		this._profileService.updateProfile(this.userId, profileData)
			.flatMap((response) => {
				return this._profileService.updatePhoneNumbers(this.userId, this.profile.id, phone_numbers);
			})
			.flatMap((response) => {
				return this._profileService.updateEmergencyContact(this.userId, this.profile.id, emergency_contacts);
			})
			.flatMap((response) => {
				return this._profileService.updateWork(this.userId, this.profile.id, work);
			}).flatMap((response) => {
				return this._profileService.updateEducation(this.userId, this.profile.id, education);
			}).flatMap((response) => {
				return this._profileService.updatePeer(this.userId, { 'email': email });
			}).flatMap((response) => {
				return this._profileService.updatePeer(this.userId, { 'phone': profileData.phone_numbers });
			}).subscribe((response) => {
				this.busyUpdate = false;
				this.snackBar.open('Profile Updated', 'Close', {
					duration: 5000
				});
			}, (err) => {
				console.log('Error updating Peer: ');
				console.log(err);
				this.snackBar.open('Profile Update Failed', 'Retry', {
					duration: 5000
				}).onAction().subscribe((response) => {
					this.busyUpdate = false;
					this.saveProfile();
				});
			});
	}

	// public sanitize(profileData) {
	//   const fields = ['first_name', 'last_name', 'headline'];
	//   let tempData = profileData;
	//   fields.forEach(element => {
	//     tempData.element = this.ucFirstPipe.transform(profileData[element]);
	//   });
	//   return tempData;
	// }

	/**
	 * deletework
	 index:number   */
	public deleteWork(index: number) {
		const work = <FormArray>this.profileForm.controls['work'];
		if (index > 0) {
			work.removeAt(index);
			return;
		}
		const workEntry = <FormGroup>work.controls[index];
		workEntry.controls.position.patchValue('');
		workEntry.controls.company.patchValue('');
		workEntry.controls.startDate.patchValue(null);
		workEntry.controls.endDate.patchValue(null);
		workEntry.controls.presentlyWorking.patchValue(false);
	}

	/**
	 * addwork
	 */
	public addWork() {
		const work = <FormArray>this.profileForm.controls['work'];
		work.push(
			this.initializeWorkForm()
		);
	}

	/**
	 * deleteeducation(index)  */
	public deleteEducation(index: number) {
		const education = <FormArray>this.profileForm.controls['education'];
		if (index > 0) {
			education.removeAt(index);
			return;
		}
		const educationEntry = <FormGroup>education.controls[index];
		educationEntry.controls.degree.patchValue('');
		educationEntry.controls.school.patchValue('');
		educationEntry.controls.startYear.patchValue('');
		educationEntry.controls.endYear.patchValue('');
		educationEntry.controls.presentlyPursuing.patchValue(false);
	}

	/**
	 * name
	 */
	public addEducation() {
		const education = <FormArray>this.profileForm.controls['education'];
		education.push(
			this.initializeEducationForm()
		);
	}

	/**
	 * addPhoneControl
	 */
	public addPhoneControl() {
		const phones = <FormArray>this.profileForm.controls['phone_numbers'];
		phones.push(this.initializePhone('', '', false));
	}

	/**
	 * clearEntry
	 index:number   */
	public clearEntry(index: number, isPrimary: boolean) {
		const phones = <FormArray>this.profileForm.controls['phone_numbers'];
		if (!isPrimary) {
			phones.removeAt(index);
			return;
		}
		const phoneNumber = <FormGroup>phones.controls[index];
		phoneNumber.controls.country_code.patchValue('');
		phoneNumber.controls.subscriber_number.patchValue('');
	}

	/**
	 * deleteLanguage
	 index:number   */
	public deleteLanguage(index: number) {
		const other_languages = <FormArray>this.profileForm.controls['other_languages'];
		other_languages.removeAt(index);
	}

	/**
	 * addlanguage
	 */
	public addlanguage() {
		const other_languages = <FormArray>this.profileForm.controls['other_languages'];
		other_languages.push(this._fb.control(['']));
	}

	/**
	 * deleteEmergencyContact
	 */
	public deleteEmergencyContact(index: number) {
		const emergency_contact = <FormArray>this.profileForm.controls['emergency_contact'];
		if (index > 0) {

			emergency_contact.removeAt(index);
			return;
		}
		const phoneNumber = <FormGroup>emergency_contact.controls[index];
		phoneNumber.controls.country_code.patchValue('');
		phoneNumber.controls.subscriber_number.patchValue('');
	}

	/**
	 * addEmergencyContact
	 */
	public addEmergencyContact() {
		const emergency_contact = <FormArray>this.profileForm.controls['emergency_contact'];
		emergency_contact.push(this.initializeEmergencyContact());
	}

	// Other Language
	public selected(event) {
		const temp_array = [];
		event.forEach(element => {
			if (element && element.name) {
				temp_array.push(element.name);
			} else if (element) {
				temp_array.push(element);
			}
		});
		const other_languages = <FormArray>this.profileForm.controls['other_languages'];
		temp_array.forEach(language => {
			if (other_languages.value.indexOf(language) === -1) {
				other_languages.push(new FormControl(language));
			}
		});
	}

	public removed(event) {
		const other_languages = <FormArray>this.profileForm.controls['other_languages'];
		let temp_array = [];
		temp_array = _.filter(other_languages.value, (item) => {
			return item !== event[0].name;
		});
		this.profileForm.setControl('other_languages', this._fb.array(
			temp_array
		));
	}

}
