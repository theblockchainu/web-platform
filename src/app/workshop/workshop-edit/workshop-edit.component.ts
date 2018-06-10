import 'rxjs/add/operator/switchMap';
import { Component, OnInit, Input, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/publishReplay';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import * as moment from 'moment';
import { CountryPickerService } from '../../_services/countrypicker/countrypicker.service';
import { LanguagePickerService } from '../../_services/languagepicker/languagepicker.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
import * as _ from 'lodash';
import { MatDialog, MatSnackBar } from '@angular/material';
import { LeftSidebarService } from '../../_services/left-sidebar/left-sidebar.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { Observable } from 'rxjs/Observable';
import { TopicService } from '../../_services/topic/topic.service';
import { PaymentService } from '../../_services/payment/payment.service';
import { environment } from '../../../environments/environment';
import { MediaMatcher } from '@angular/cdk/layout';
import { ProfileService } from '../../_services/profile/profile.service';

@Component({
	selector: 'app-workshop-edit',
	templateUrl: './workshop-edit.component.html',
	styleUrls: ['./workshop-edit.component.scss']
})

export class WorkshopEditComponent implements OnInit, AfterViewInit, OnDestroy {
	public busySave = false;
	public busyPreview = false;
	public busyInterest = false;
	public busyLanguage = false;
	public busyBasics = false;
	public busyHost = false;
	public busyWorkshopPage = false;
	public busyPayment = false;
	public sidebarFilePath = 'assets/menu/workshop-static-left-sidebar-menu.json';
	public sidebarMenuItems;
	public itenariesForMenu = [];
	public envVariable;
	public interest1: FormGroup;
	public newTopic: FormGroup;
	public workshop: FormGroup;
	public selectedTopic: FormGroup;
	public timeline: FormGroup;
	public conditions: FormGroup;
	public phoneDetails: FormGroup;

	public supplementUrls = new FormArray([]);
	public uploadingImage = false;
	public uploadingVideo = false;

	public workshopId: string;
	public workshopData: any;
	public isWorkShopActive = false;
	public activeWorkshop = '';
	// Set our default values
	public localState = { value: '' };
	public countries: any[];
	public languagesArray: any[];
	public userId;
	public selectedValues: boolean[] = [false, false];
	public selectedOption = -1;

	public searchTopicURL = '';
	public createTopicURL = '';
	public placeholderStringTopic = 'Search for a topic ';
	public maxTopicMsg = 'Choose max 3 related topics';


	public difficulties = [];
	public cancellationPolicies = [];
	public contentComplete = false;
	public currencies = [];
	public key;
	public maxTopics = 3;
	public otpSent = false;

	public availableAssessmentTypes = [];
	public availableAssessmentStyles = [];

	profileImagePending: Boolean;
	workshopVideoPending: Boolean;
	workshopImage1Pending: Boolean;
	workshopImage2Pending: Boolean;

	public step: number;
	public max = 14;
	public learnerType_array;
	public selectedLanguages;
	public suggestedTopics = [];
	public interests = [];
	public removedInterests = [];
	public relTopics = [];

	public days;

	public _CANVAS;
	public _VIDEO;
	public _CTX;

	public urlForVideo = [];
	public urlForImages = [];

	public datesEditable = false;
	public isPhoneVerified = false;
	public isSubmitted = false;
	public connectPaymentUrl = '';
	public freeWorkshop = false;
	filteredLanguageOptions: Observable<string[]>;
	public payoutLoading = true;
	public payoutAccounts: Array<any>;
	public query = {
		'include': [
			'topics',
			'calendars',
			{ 'participants': [{ 'profiles': ['work'] }] },
			{ 'owners': [{ 'profiles': ['phone_numbers'] }] },
			{ 'contents': ['schedules'] },
			'payoutrules',
			{ 'assessment_models': ['assessment_na_rules', 'assessment_rules'] }]
	};
	public paymentInfo: FormGroup;
	private payoutRuleNodeId: string;
	private payoutRuleAccountId: string;
	// TypeScript public modifiers
	public currentDate: Date;
	public mobileQuery: MediaQueryList;
	private _mobileQueryListener: () => void;
	public gyanBalance: number;
	public nAAssessmentParams: Array<string>;
	public maxGyanExceding: boolean;
	totalGyan: number;
	totalDuration: number;
	public assessmentForm: FormGroup;
	public isWorkshopActive = false;

	constructor(
		public router: Router,
		private activatedRoute: ActivatedRoute,
		private http: HttpClient,
		private languagePickerService: LanguagePickerService,
		private _fb: FormBuilder,
		private countryPickerService: CountryPickerService,
		public _collectionService: CollectionService,
		private mediaUploader: MediaUploaderService,
		public requestHeaderService: RequestHeaderService,
		private dialog: MatDialog,
		private _leftSideBarService: LeftSidebarService,
		private dialogsService: DialogsService,
		private snackBar: MatSnackBar,
		private _cookieUtilsService: CookieUtilsService,
		private _topicService: TopicService,
		private _paymentService: PaymentService,
		private location: Location,
		private media: MediaMatcher,
		public cd: ChangeDetectorRef,
		private profileService: ProfileService
	) {
		this.envVariable = environment;
		this.activatedRoute.params.subscribe(params => {
			this.workshopId = params['collectionId'];
			this.step = Number(params['step']);
			this.connectPaymentUrl = 'https://connect.stripe.com/express/oauth/authorize?response_type=code' +
				'&client_id=ca_AlhauL6d5gJ66yM3RaXBHIwt0R8qeb9q&scope=read_write&redirect_uri='
				+ environment.clientUrl + '/console/account/payoutmethods&state=' + environment.clientUrl
				+ '/workshop/' + this.workshopId + '/edit/' + this.step;
			this.searchTopicURL = environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics/suggest?field=name&query=';
			this.createTopicURL = environment.apiUrl + '/api/' + environment.uniqueDeveloperCode + '_topics';
		});
		this.userId = _cookieUtilsService.getValue('userId');
		this.currentDate = moment().toDate();
		this.getGyanBalance();

	}

	getGyanBalance() {
		this.gyanBalance = 0;
		this.profileService.getGyanBalance(this.userId).subscribe(res => {
			this.gyanBalance = Number(res);
		});
	}

	validateGyan() {
		this.totalGyan = this.workshop.controls['academicGyan'].value + this.workshop.controls['nonAcademicGyan'].value;
		if (this.totalGyan > this.gyanBalance) {
			this.maxGyanExceding = true;
		} else {
			this.maxGyanExceding = false;
		}
	}

	public ngOnInit() {
		this.maxGyanExceding = false;

		this.interest1 = new FormGroup({
			// interests: this._fb.array([])
		});

		this.newTopic = this._fb.group({
			topicName: ['', Validators.requiredTrue]
		});

		this.paymentInfo = this._fb.group({
			id: ''
		});
		// this.paymentInfo.controls['id'].valueChanges.subscribe((res) => {
		//   this.updatePayoutRule(res);
		// });
		this.workshop = this._fb.group({
			// id: '',
			type: 'workshop',
			title: '',
			stage: '',
			language: this._fb.array([]),
			selectedLanguage: '',
			headline: '',
			description: [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(800)])],
			difficultyLevel: '',
			prerequisites: '',
			maxSpots: '',
			videoUrls: [],
			imageUrls: [],
			totalHours: '',
			price: 0,
			currency: 'USD',
			cancellationPolicy: '24 Hours',
			ageLimit: '',
			aboutHost: '', // [null,Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(200)])],
			notes: '',
			// isApproved: '',
			approvedBy: '',
			// isCanceled: '',
			canceledBy: '',
			status: 'draft',
			// createdAt: '',
			// updatedAt: ''
			academicGyan: '',
			nonAcademicGyan: ''
		});


		this.timeline = this._fb.group({
			calendar: this._fb.group({
				startDate: null,
				endDate: null
			}),
			contentGroup: this._fb.group({
				itenary: this._fb.array([])
			})
		});

		this.conditions = this._fb.group({
			standards: '',
			terms: ''
		});

		this.selectedTopic = new FormGroup({});

		this.phoneDetails = this._fb.group({
			phoneNo: [{ value: '', disabled: true }],
			inputOTP: '',
			countryCode: [{ value: '', disabled: true }]
		});

		this.assessmentForm = this._fb.group({
			type: ['', Validators.required],
			style: ['', Validators.required],
			rules: this._fb.array([
				this._fb.group({
					value: ['', Validators.required],
					gyan: ['', Validators.required]
				})
			], Validators.minLength(1)),
			nARules: this._fb.array([
				this._fb.group({
					value: ['', Validators.required],
					gyan: ['', Validators.required]
				})
			], Validators.minLength(1))
		});

		this.initializeFormFields();
		this.initializeWorkshop();
		this._CANVAS = <HTMLCanvasElement>document.querySelector('#video-canvas');
		this._VIDEO = document.querySelector('#main-video');


		this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
		this._mobileQueryListener = () => this.cd.detectChanges();
		this.mobileQuery.addListener(this._mobileQueryListener);
	}

	private initializeAssessment(result) {
		if (result.assessment_models[0]) {
			this.assessmentForm.controls['type'].patchValue(result.assessment_models[0].type);
			this.assessmentForm.controls['style'].patchValue(result.assessment_models[0].style);
			if (result.assessment_models[0].assessment_rules && result.assessment_models[0].assessment_rules.length > 0) {
				const rulesArray = <FormArray>this.assessmentForm.controls['rules'];
				rulesArray.removeAt(0);
				result.assessment_models[0].assessment_rules.forEach(rule => {
					rulesArray.push(this._fb.group({
						value: rule.value,
						gyan: rule.gyan
					}));
				});
			}
			if (result.assessment_models[0].assessment_na_rules && result.assessment_models[0].assessment_na_rules.length > 0) {
				const rulesArray = <FormArray>this.assessmentForm.controls['nARules'];
				rulesArray.removeAt(0);
				result.assessment_models[0].assessment_na_rules.forEach(rule => {
					rulesArray.push(this._fb.group({
						value: rule.value,
						gyan: rule.gyan
					}));
				});
			}
		}
	}

	public addAssessmentRule() {
		const rulesArray = <FormArray>this.assessmentForm.controls['rules'];
		console.log(rulesArray);
		rulesArray.push(this._fb.group({
			value: '',
			gyan: ''
		}));
	}

	public deleteAssessmentRule(i: number) {
		const rulesArray = <FormArray>this.assessmentForm.controls['rules'];
		rulesArray.removeAt(i);
	}

	public deleteNAAssessmentRule(i: number) {
		const rulesArray = <FormArray>this.assessmentForm.controls['nARules'];
		rulesArray.removeAt(i);
	}


	public addNAAssessmentRule() {
		const rulesArray = <FormArray>this.assessmentForm.controls['nARules'];
		rulesArray.push(this._fb.group({
			value: '',
			gyan: ''
		}));
	}

	public submitAssessment() {
		let assessmentModelObject;
		this._collectionService.updateAssessmentModel(this.workshopId, {
			type: this.assessmentForm.controls['type'].value,
			style: this.assessmentForm.controls['style'].value
		}).flatMap(res => {
			console.log(res);
			assessmentModelObject = <any>res;
			this.workshopData.assessment_models = [assessmentModelObject];
			return this._collectionService.updateAssessmentRules(assessmentModelObject.id, this.assessmentForm.controls['rules'].value);
		}).flatMap(res => {
			this.workshopData.assessment_models[0].assessment_rules = res;
			return this._collectionService.updateNAAssessmentRules(assessmentModelObject.id, this.assessmentForm.controls['nARules'].value);
		}).subscribe(res => {
			this.workshopData.assessment_models[0].assessment_na_rules = res;
			this._leftSideBarService.updateSideMenu(this.workshopData, this.sidebarMenuItems);
			this.step++;
			this.workshopStepUpdate();
			this.router.navigate(['workshop', this.workshopId, 'edit', this.step]);
		}, err => {
			console.log(err);
			this.snackBar.open('An error occurred', 'close', {
				duration: 5000
			});
		});
	}

	private extractDate(dateString: string) {
		return moment.utc(dateString).local().toDate();
	}

	private extractTime(dateString: string) {
		const time = moment.utc(dateString).local().format('HH:mm:ss');
		return time;
	}

	private updatePayoutRule(newPayoutId) {
		if (this.payoutRuleNodeId) {
			this.payoutLoading = true;
			this._paymentService.patchPayoutRule(this.payoutRuleNodeId, newPayoutId).subscribe(res => {
				if (res) {
					this.payoutLoading = false;
					this.payoutRuleAccountId = newPayoutId;
					this.snackBar.open('Payout account updated', 'Close', {
						duration: 5000
					});
				}
			}, err => {
				this.payoutLoading = false;
				this.snackBar.open('Unable to update account', 'Close', {
					duration: 5000
				});
			});
		} else {
			this._paymentService.postPayoutRule(this.workshopId, newPayoutId).subscribe((res: any) => {
				if (res) {
					this.payoutLoading = false;
					this.snackBar.open('Payout account added', 'Close', {
						duration: 5000
					});
					this.payoutRuleNodeId = res.id;
					this.payoutRuleAccountId = newPayoutId;
				}
			}, err => {
				this.payoutLoading = false;
				this.snackBar.open('Unable to add account', 'Close', {
					duration: 5000
				});
			});

		}
	}

	private initializeTimeLine(res) {
		console.log('Timeline');
		console.log(res);
		const sortedCalendar = this.sort(res.calendars, 'startDate', 'endDate');
		if (sortedCalendar[0] !== undefined && sortedCalendar[0].startDate) {
			const calendar = sortedCalendar[0];
			calendar['startDate'] = this.extractDate(calendar.startDate);
			calendar['endDate'] = this.extractDate(calendar.endDate);
			this._collectionService.sanitize(calendar);

			if (this.workshopData.status === 'active') {
				this.isWorkshopActive = true;
				this.activeWorkshop = 'disabledMAT';
			}
			this.timeline.controls.calendar.patchValue(calendar);
			this.initializeContentForm(res);
		}
		this.initializeCalendarCheck(res);

	}

	private initializeCalendarCheck(workshopData: any) {
		const calendarForm = <FormGroup>this.timeline.controls['calendar'];
		const contentGroup = <FormGroup>this.timeline.controls.contentGroup;
		const itenariesArray = <FormArray>contentGroup.controls['itenary'];
		calendarForm.valueChanges.subscribe(res => {
			const contentGroupForm = <FormGroup>this.timeline.controls['contentGroup'];
			const itenaryArray = <FormArray>contentGroupForm.controls['itenary'];
			if (this.step.toString() === '13' && this.timeline) {
				if (itenaryArray.length > 0) {
					itenariesArray.controls.forEach((itenary: FormGroup) => {
						if (itenary.controls['startDay']) {
							const newDate = this.calculatedDate(this.timeline.value.calendar.startDate, itenary.controls['startDay'].value);
							itenary.controls['date'].patchValue(newDate);
						}
					});
				}
			}
		});
	}

	private createClone() {
		this.dialogsService.openCollectionCloneDialog({
			type: 'workshop'
		}).subscribe((result) => {
			if (result === 'accept') {
				this._collectionService.patchCollection(this.workshopId, {}).subscribe((response: any) => {
					const newCollection = response;
					if (newCollection.isNewInstance) {
						this.router.navigate(['workshop', newCollection.id, 'edit', this.step]);
					}
				});
			} else if (result === 'reject') {
				this.router.navigate(['/console/teaching/workshops']);
			}
		});
	}

	public initializeContentForm(res) {
		const contentGroup = <FormGroup>this.timeline.controls.contentGroup;
		const itenary = <FormArray>contentGroup.controls.itenary;
		const itenaries = this.getContents(res.contents);
		for (const key in itenaries) {
			if (itenaries.hasOwnProperty(key)) {
				const itr: FormGroup = this.InitItenary();
				itr.controls.date.patchValue(moment(this.calculatedDate(this.timeline.value.calendar.startDate, key)).toDate());
				itr.controls.startDay.patchValue(key);
				for (const contentObj of itenaries[key]) {
					const contentForm: FormGroup = this.InitContent();
					this.assignFormValues(contentForm, contentObj);
					const contents = <FormArray>itr.controls.contents;
					contents.push(contentForm);
				}
				itenary.push(itr);
			}
		}
	}

	/**
	 * assignFormValues
	 */
	public assignFormValues(form: FormGroup, value: any) {
		for (const key in value) {
			if (value.hasOwnProperty(key) && form.controls[key]) {
				if (form.controls[key] instanceof FormGroup) {
					this.assignFormValues(<FormGroup>form.controls[key], value[key]);
				} else {
					if (key === 'startTime' || key === 'endTime') {
						form.controls[key].patchValue(this.extractTime(value[key]));
					} else if (key === 'startDay' || key === 'endDay') {
						form.controls[key].patchValue(this.calculatedDate(this.timeline.value.calendar.startDate, value[key]));
					} else if (key === 'supplementUrls') {
						const control = <FormArray>form.controls[key];
						value[key].forEach(supplementUrl => {
							control.push(new FormControl(supplementUrl));
						});
					} else {
						form.controls[key].patchValue(value[key]);
					}
				}
			} else {
			}
		}
	}

	public InitItenary() {
		return this._fb.group({
			contents: this._fb.array([]),
			date: [''],
			startDay: ['']
		});
	}

	public InitContent() {
		return this._fb.group({
			id: [''],
			title: ['', [Validators.required, Validators.minLength(10)]],
			type: [''],
			description: [''],
			supplementUrls: this._fb.array([]),
			requireRSVP: [''],
			itemsProvided: this._fb.array([]),
			notes: [''],
			imageUrl: [''],
			prerequisites: [''],
			schedule: this._fb.group({
				id: [''],
				startDay: [''],
				endDay: [''],
				startTime: [''],
				endTime: ['']
			}),
			pending: ['']
		});
	}

	public getContents(contents) {
		const itenaries = {};
		for (const contentObj of contents) {
			contentObj.schedule = contentObj.schedules[0];
			delete contentObj.schedules;
			if (itenaries.hasOwnProperty(contentObj.schedule.startDay)) {
				itenaries[contentObj.schedule.startDay].push(contentObj);
			} else {
				itenaries[contentObj.schedule.startDay] = [contentObj];
				this.itenariesForMenu.push(contentObj.schedule.startDay);
			}
		}
		if (this.sidebarMenuItems) {
			this.sidebarMenuItems[2]['submenu'] = [];
			let i = 1;
			this.itenariesForMenu.forEach(function (item) {
				const index = i;
				this.sidebarMenuItems[2]['submenu'].push({
					'title': 'Day ' + index,
					'step': 13 + '_' + index,
					'active': false,
					'visible': true,
					'locked': false,
					'complete': false
				});
				i++;
			}, this);
		} else {
			// this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(this.workshop.value, this.sidebarMenuItems);
			// this.sidebarMenuItems[2]['submenu'] = [];
		}

		return itenaries;
	}

	private initializeFormFields() {
		this.difficulties = ['Beginner', 'Intermediate', 'Advanced'];

		this.cancellationPolicies = ['24 Hours', '3 Days', '1 Week'];

		this.currencies = ['USD', 'INR', 'GBP'];

		this.availableAssessmentTypes = ['Peer', 'Teacher', 'Third Party'];

		this.availableAssessmentStyles = ['Grades', 'Percentage', 'Percentile'];

		this.nAAssessmentParams = ['attendance', 'community'];

		this.learnerType_array = {
			learner_type: [
				{ id: 'auditory', display: 'Auditory' }
				, { id: 'visual', display: 'Visual' }
				, { id: 'read-write', display: 'Read & Write' }
				, { id: 'kinesthetic', display: 'Kinesthetic' }
			]
		};

		this.placeholderStringTopic = 'Search for a topic or enter a new one';

		this.key = 'access_token';

		this.countryPickerService.getCountries()
			.subscribe((countries) => this.countries = countries);

		this.languagePickerService.getLanguages()
			.subscribe((languages) => {
				this.languagesArray = _.map(languages, 'name');
				this.filteredLanguageOptions = this.workshop.controls.selectedLanguage.valueChanges
					.startWith(null)
					.map(val => val ? this.filter(val) : this.languagesArray.slice());
			});

		if (this.interests.length === 0) {
			this.http.get(environment.searchUrl + '/api/search/topics', this.requestHeaderService.options)
				.map((response: any) => {
					this.suggestedTopics = response.slice(0, 7);
				}).subscribe();
		} else {
			this.suggestedTopics = this.interests;
		}

		this.profileImagePending = true;
		this.workshopVideoPending = true;
		this.workshopImage1Pending = true;

		this.workshop.controls['academicGyan'].valueChanges.subscribe(res => {
			this.validateGyan();
		});
		this.workshop.controls['nonAcademicGyan'].valueChanges.subscribe(res => {
			this.validateGyan();
		});
		this.timeline.valueChanges.subscribe(res => {
			this.totalHours();
		});
	}

	private totalHours(): void {
		let totalLength = 0;
		this.timeline.value.contentGroup.itenary.forEach((itenaryObj: any) => {
			itenaryObj.contents.forEach(contentObj => {
				if (contentObj.type === 'online') {
					const startMoment = moment(contentObj.schedule.startTime);
					const endMoment = moment(contentObj.schedule.endTime);
					const contentLength = moment.utc(endMoment.diff(startMoment)).format('HH');
					totalLength += parseInt(contentLength, 10);
				}
			});
		});
		this.totalDuration = totalLength;
	}

	filter(val: string): string[] {
		return this.languagesArray.filter(option =>
			option.toLowerCase().indexOf(val.toLowerCase()) === 0);
	}

	private initializeWorkshop() {
		if (this.workshopId) {
			this._collectionService.getCollectionDetail(this.workshopId, this.query)
				.subscribe((res) => {
					this.workshopData = res;
					if (this.workshopData.payoutrules && this.workshopData.payoutrules.length > 0) {
						this.payoutRuleNodeId = this.workshopData.payoutrules[0].id;
						this.payoutRuleAccountId = this.workshopData.payoutrules[0].payoutId1;
					}
					this.retrieveAccounts();
					this.initializeFormValues(res);
					this.initializeTimeLine(res);
					this.initializeAssessment(res);

					if (res.status === 'active' && this.sidebarMenuItems) {
						this.sidebarMenuItems[3].visible = false;
						this.sidebarMenuItems[4].visible = true;
						this.sidebarMenuItems[4].active = true;
						this.sidebarMenuItems[4].submenu[0].visible = true;
						this.sidebarMenuItems[4].submenu[1].visible = true;
					}

				},
					err => console.log('error'),
					() => console.log('Completed!'));

		} else {
			console.log('NO COLLECTION');
		}
	}

	public languageChange(event) {
		this.busyLanguage = true;
		if (event) {
			this.selectedLanguages = event;
			this.busyLanguage = false;
			// this.workshop.controls.selectedLanguage.setValue(event.value);
		}
	}



	private retrieveAccounts() {
		this.payoutAccounts = [];
		this._paymentService.retrieveConnectedAccount().subscribe(result => {
			this.payoutAccounts = result;
			result.forEach(account => {
				if (this.payoutRuleNodeId && this.payoutRuleAccountId && account.payoutaccount.id === this.payoutRuleAccountId) {
					this.paymentInfo.controls['id'].patchValue(this.payoutRuleAccountId);
				}
			});
			this.paymentInfo.controls['id'].valueChanges.subscribe(res => {
				this.updatePayoutRule(res);
			});
			this.payoutLoading = false;
		}, err => {
			console.log(err);
			this.payoutLoading = false;
		});
		/*this._paymentService.retrieveLocalPayoutAccounts().subscribe(result => {
		  console.log(result);
		  this.payoutAccounts = result;
		  this.payoutLoading = false;
		  if (this.payoutRuleNodeId) {
			this.paymentInfo.controls['id'].patchValue(this.workshopData.payoutrules[0].payoutId1);
		  }
		  this.paymentInfo.controls['id'].valueChanges.subscribe(res => {
			this.updatePayoutRule(res);
		  });
		}, err => {
		  console.log(err);
		  this.payoutLoading = false;
		});*/
	}

	public selected(event) {
		if (event.length > 3) {
			this.maxTopicMsg = 'You cannot select more than 3 topics. Please delete any existing one and then try to add.';
		}
		this.interests = event;
		this.suggestedTopics = event;
		this.suggestedTopics.map((obj) => {
			obj.checked = 'true';
			return obj;
		});
	}

	public removed(event) {
		const body = {};
		this.removedInterests = event;
		if (this.removedInterests.length !== 0) {
			this.removedInterests.forEach((topic) => {
				this.http.delete(environment.apiUrl + '/api/collections/' + this.workshopId + '/topics/rel/' + topic.id, this.requestHeaderService.options)
					.map((response) => {
					}).subscribe();
			});

		}
	}

	public daysCollection(event) {
		this.days = event;
		this.sidebarMenuItems[2]['submenu'] = [];
		this.days.controls.forEach(function (item, index) {
			const index2 = +index + 1;
			this.sidebarMenuItems[2]['submenu'].push({
				'title': 'Day ' + index2,
				'step': 13 + '_' + index2,
				'active': false,
				'visible': true,
				'locked': false,
				'complete': false
			});
		}, this);
	}

	public getMenuArray(event) {
		this.sidebarMenuItems = event;
	}


	private initializeFormValues(res) {
		// Topics
		this.relTopics = _.uniqBy(res.topics, 'id');
		this.interests = this.relTopics;
		if (this.interests) {
			this.suggestedTopics = this.interests;
		}
		// Language
		if (res.language && res.language.length > 0) {
			this.selectedLanguages = res.language[0];
			this.workshop.controls.selectedLanguage.patchValue(res.language[0]);
		}
		// aboutHost TBD
		this.workshop.controls.aboutHost.patchValue(res.aboutHost);

		// Title
		this.workshop.controls.title.patchValue(res.title);

		// Headline
		this.workshop.controls.headline.patchValue(res.headline);

		// Description
		this.workshop.controls.description.patchValue(res.description);

		// Difficulty Level
		this.workshop.controls.difficultyLevel.patchValue(res.difficultyLevel);

		// Notes
		this.workshop.controls.notes.patchValue(res.notes);

		// Seats
		this.workshop.controls.maxSpots.patchValue(res.maxSpots);

		// Photos and Videos
		if (res.videoUrls && res.videoUrls.length > 0) {
			this.workshop.controls['videoUrls'].patchValue(res.videoUrls);
			this.urlForVideo = res.videoUrls;
		}
		if (res.imageUrls && res.imageUrls.length > 0) {
			this.workshop.controls['imageUrls'].patchValue(res.imageUrls);
			this.urlForImages = res.imageUrls;
		}

		// Currency, Amount, Cancellation Policy
		this.workshop.controls.price.patchValue(res.price);
		if (res.price === 0) {
			this.freeWorkshop = true;
		}
		if (res.currency) {
			this.workshop.controls.currency.patchValue(res.currency);
		}
		if (res.cancellationPolicy) {
			this.workshop.controls.cancellationPolicy.setValue(res.cancellationPolicy);
		}

		// Status
		this.workshop.controls.status.setValue(res.status);

		// Gyan
		this.workshop.controls['academicGyan'].patchValue(res.academicGyan);

		this.workshop.controls['nonAcademicGyan'].patchValue(res.nonAcademicGyan);


		this.isPhoneVerified = res.owners[0].phoneVerified;

		this.isSubmitted = this.workshop.controls.status.value === 'submitted';

		if (res.owners[0].profiles[0].phone_numbers && res.owners[0].profiles[0].phone_numbers.length) {
			this.phoneDetails.controls.phoneNo.patchValue(res.owners[0].profiles[0].phone_numbers[0].subscriber_number);
		}

		if (res.owners[0].profiles[0].phone_numbers && res.owners[0].profiles[0].phone_numbers.length) {
			this.phoneDetails.controls.phoneNo.patchValue(res.owners[0].profiles[0].phone_numbers[0].subscriber_number);
			this.phoneDetails.controls.countryCode.patchValue(res.owners[0].profiles[0].phone_numbers[0].country_code);
		}
		if (!this.timeline.controls.calendar.value.startDate || !this.timeline.controls.calendar.value.endDate) {
			this.makeDatesEditable();
		}
	}

	initAddress() {
		// initialize our address
		return this._fb.group({
			street: ['', Validators.required],
			postcode: ['']
		});
	}
	public workshopStepUpdate() {
		if (this.workshop.value.stage < this.step) {
			this.workshop.patchValue({
				'stage': this.step
			});
		}

	}

	public addImageUrl(value: String) {
		this.urlForImages.push(value);
		const control = <FormArray>this.workshop.controls['imageUrls'];
		this.workshopImage1Pending = false;
		control.patchValue(this.urlForImages);
		const tempWorkshopData = this.workshopData;
		tempWorkshopData.imageUrls = this.workshop.controls['imageUrls'].value;
		this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(tempWorkshopData, this.sidebarMenuItems);
	}

	public addVideoUrl(value: String) {
		this.urlForVideo.push(value);
		const control = this.workshop.controls['videoUrls'];
		this.workshopVideoPending = false;
		control.patchValue(this.urlForVideo);
		const tempWorkshopData = this.workshopData;
		tempWorkshopData.videoUrls = this.workshop.controls['videoUrls'].value;
		this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(tempWorkshopData, this.sidebarMenuItems);
	}

	uploadVideo(event) {
		this.uploadingVideo = true;
		for (const file of event.files) {
			this.mediaUploader.upload(file).subscribe((response) => {
				this.addVideoUrl(response.url);
				this.uploadingVideo = false;
			});
		}
	}

	uploadImage(event) {
		this.uploadingImage = true;
		for (const file of event.files) {
			this.mediaUploader.upload(file).subscribe((response) => {
				this.addImageUrl(response.url);
				this.uploadingImage = false;
			}, err => {
				this.snackBar.open(err.message, 'Close', { duration: 5000 });
				this.uploadingImage = false;
			});
		}
	}

	public changeInterests(topic: any) {
		const index = this.interests.indexOf(topic);
		if (index > -1) {
			this.interests.splice(index, 1); // If the user currently uses this topic, remove it.
		} else {
			this.interests.push(topic); // Otherwise add this topic.
		}
	}

	public submitWorkshop(data, timeline?, step?) {
		if (this.calendarIsValid()) {
			switch (Number(this.step)) {
				case 11:
					this.totalGyan = this.workshop.controls['academicGyan'].value + this.workshop.controls['nonAcademicGyan'].value;
					console.log(this.totalGyan);
					console.log(this.gyanBalance);
					if (this.totalGyan > this.gyanBalance) {
						this.dialogsService.showGyanNotif(this.gyanBalance, this.totalGyan).subscribe(res => {
							if (res) {
								this.checkStatusAndSubmit(data, timeline, step);
							}
						});
					} else {
						this.checkStatusAndSubmit(data, timeline, step);
					}
					break;
				case 14:
					if (!this.workshopHasOnlineContent(timeline) && (this.totalGyan > this.gyanBalance) && (this.totalDuration <= this.totalGyan)) {
						this.snackBar.open('You still need to add ' + (this.totalGyan - this.totalDuration) + ' hours of learning to proceed',
							'Close', { duration: 3000 });
					} else {
						this.checkStatusAndSubmit(data, timeline, step);
					}
					break;
				default:
					this.checkStatusAndSubmit(data, timeline, this.step);
					break;
			}
		}
	}

	private checkStatusAndSubmit(data, timeline?, step?) {
		if (this.workshop.controls.status.value === 'active') {
			this.dialogsService.openCollectionCloneDialog({
				type: 'workshop'
			}).subscribe((result) => {
				if (result === 'accept') {
					this.executeSubmitWorkshop(data, timeline, step);
				} else if (result === 'reject') {
					this.router.navigate(['/console/teaching/workshops']);
				}
			});
		} else {
			console.log(step);
			this.executeSubmitWorkshop(data, timeline, step);
		}
	}

	public workshopHasOnlineContent(timeline: any) {
		console.log(timeline.value);
		let workshopValid = false;
		for (const ItennaryObj of timeline.value.contentGroup.itenary) {
			for (const contentObj of ItennaryObj.contents) {
				if (contentObj.type.toString() === 'online') {
					workshopValid = true;
					return true;
				}
			}
			this.snackBar.open('Workshop should contain atleast 1 online session!', 'Close', {
				duration: 5000
			});
			return false;
		}
	}


	private calendarIsValid() {
		const calendarGroup = <FormGroup>this.timeline.controls['calendar'];
		const startMoment = moment(calendarGroup.controls['startDate'].value).local();
		const endMoment = moment(calendarGroup.controls['endDate'].value).local();
		if (startMoment.diff(endMoment) > 0) {
			this.snackBar.open('Start date cannot be after end date!', 'Close', {
				duration: 5000
			});
			return false;
		}
		console.log(startMoment.diff(moment()));
		if (startMoment.diff(moment()) < 0) {
			this.snackBar.open('Start date cannot be in the past!', 'Close', {
				duration: 5000
			});
			return false;
		}
		return true;
	}

	private executeSubmitWorkshop(data, timeline?, step?) {
		const lang = <FormArray>this.workshop.controls.language;
		lang.removeAt(0);
		lang.push(this._fb.control(data.value.selectedLanguage));
		const body = data.value;
		delete body.selectedLanguage;

		this._collectionService.patchCollection(this.workshopId, body).subscribe(
			(response: any) => {
				const result = response;
				let collectionId;
				if (result.isNewInstance) {
					this.workshop.controls.status.setValue(result.status);
					collectionId = result.id;
				} else {
					collectionId = this.workshopId;
				}
				result.topics = this.workshopData.topics;
				result.contents = this.workshopData.contents;
				result.owners = this.workshopData.owners;
				this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(result, this.sidebarMenuItems);

				if (step && step === 14) {
					this.submitTimeline(collectionId, timeline);
				} else {
					this.step++;
					this.workshopStepUpdate();
					this.router.navigate(['workshop', collectionId, 'edit', this.step]);
				}
			});
	}

	/**
	 * numberOfdays
	 */
	public numberOfdays(currentDate, startDate) {
		const current = moment(currentDate);
		const start = moment(startDate);
		return current.diff(start, 'days');
	}

	/**
	 * calculatedDate
	 currenDate,day */
	public calculatedDate(currenDate, day) {
		const current = moment(currenDate);
		current.add(day, 'days');
		return current.toDate();
	}

	public submitTimeline(collectionId, data: FormGroup) {
		const body = data.value.calendar;
		if (body.startDate && body.endDate) {
			this.http.patch(environment.apiUrl + '/api/collections/' + collectionId + '/calendar', body, this.requestHeaderService.options)
				.subscribe((response) => {
					this.step++;
					this.workshopStepUpdate();
					this.router.navigate(['workshop', collectionId, 'edit', this.step]);
				});
		} else {
			console.log('Enter Date!');
		}


	}

	public submitInterests() {
		this.busyInterest = true;
		let body = {};
		let topicArray = [];
		this.interests.forEach((topic) => {
			topicArray.push(topic.id);
		});
		this.relTopics.forEach((topic) => {
			topicArray = _.without(topicArray, topic.id);
		});
		body = {
			'targetIds': topicArray
		};

		if (topicArray.length !== 0) {
			let observable: Observable<any>;
			observable = this.http.patch(environment.apiUrl + '/api/collections/' + this.workshopId + '/topics/rel', body, this.requestHeaderService.options)
				.map(response => response).publishReplay().refCount();
			observable.subscribe((res) => {
				this.step++;
				this._collectionService.getCollectionDetail(this.workshopId, this.query)
					.subscribe((resData) => {
						this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(resData, this.sidebarMenuItems);
					});
				this.workshopStepUpdate();
				this.busyInterest = false;
				this.router.navigate(['workshop', this.workshopId, 'edit', this.step]);
			});
		} else {
			this.step++;
			this.workshopStepUpdate();
			this.router.navigate(['workshop', this.workshopId, 'edit', this.step]);
		}
		// let observable: Rx.Observable<any>;
		// if (topicArray.length !== 0) {
		//   topicArray.forEach(topicId => {
		//     observable = this._topicService.relTopicCollection(this.workshopId, topicId)
		//                   .map(response => response).publishReplay().refCount();
		//     observable.subscribe((res) => {
		//       this.step++;
		//       this._collectionService.getCollectionDetail(this.workshopId, this.query)
		//         .subscribe((resData) => {
		//           this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(resData, this.sidebarMenuItems);
		//         });
		//       this.workshopStepUpdate();
		//       this.busyInterest = false;
		//       this.router.navigate(['workshop', this.workshopId, 'edit', this.step]);
		//     });
		//   });
		// }
		// else {
		//   this.step++;
		//   this.workshopStepUpdate();
		//   this.router.navigate(['workshop', this.workshopId, 'edit', this.step]);
		// }
	}

	/**
	 * goto(toggleStep)  */
	public goto(toggleStep) {
		this.busyBasics = false;
		this.busyWorkshopPage = false;
		this.step = toggleStep;
		this.router.navigate(['workshop', this.workshopId, 'edit', +toggleStep]);
		if (toggleStep === 2) {
			this.busyBasics = true;
			this.busyBasics = false;
		}
		if (toggleStep === 6) {
			this.busyWorkshopPage = true;
		}
	}



	submitForReview() {
		// Post Workshop for review
		this._collectionService.submitForReview(this.workshopId)
			.subscribe((res) => {
				this.workshop.controls.status.setValue('submitted');
				this.isSubmitted = true;
				this.dialogsService.openCollectionSubmitDialog({
					type: 'workshop'
				});

				// call to get status of workshop
				if (this.workshop.controls.status.value === 'active') {
					this.sidebarMenuItems[3].visible = false;
					this.sidebarMenuItems[4].visible = true;
					this.sidebarMenuItems[4].active = true;
					this.sidebarMenuItems[4].submenu[0].visible = true;
					this.sidebarMenuItems[4].submenu[1].visible = true;

				}
			});

	}

	saveandexit() {
		this.busySave = true;
		this.workshopStepUpdate();
		if (this.step === 14) {
			const data = this.timeline;
			const body = data.value.calendar;
			if (body.startDate && body.endDate) {
				this.http.patch(environment.apiUrl + '/api/collections/' + this.workshopId + '/calendar', body, this.requestHeaderService.options)
					.map((response) => {
						this.busySave = false;
						this.router.navigate(['console/teaching/workshops']);
					})
					.subscribe();
			} else {
				console.log('Enter Date!');
			}

		} else {
			const data = this.workshop;
			const lang = <FormArray>this.workshop.controls.language;
			lang.removeAt(0);
			lang.push(this._fb.control(data.value.selectedLanguage));
			const body = data.value;
			delete body.selectedLanguage;
			this._collectionService.patchCollection(this.workshopId, body).map(
				(response) => {
					this.router.navigate(['console/teaching/workshops']);
				}).subscribe();
		}
	}

	exit() {
		this.router.navigate(['console/teaching/workshops']);
	}

	addNewTopic() {
		let tempArray = [];
		tempArray = _.union(this.interests, tempArray);
		let topic;
		this.dialogsService
			.addNewTopic()
			.subscribe((res) => {
				if (res) {
					topic = res;
					topic.checked = true;
					tempArray.push(topic);
					this.interests = _.union(this.interests, tempArray);
					this.suggestedTopics = this.interests;
				}
			});
	}

	addNewLanguage() {
		this.dialogsService
			.addNewLanguage()
			.subscribe((res) => {
				if (res) {
					this.languagesArray.push(res);
					this.workshop.controls.selectedLanguage.patchValue(res.name);
				}
			});

	}

	uploadImage1(event) {
		if (event.target.files == null || event.target.files === undefined) {
			document.write('This Browser has no support for HTML5 FileReader yet!');
			return false;
		}

		for (let i = 0; i < event.target.files.length; i++) {
			const file = event.target.files[i];
			const imageType = /image.*/;

			if (!file.type.match(imageType)) {
				continue;

			}

			const reader = new FileReader();

			if (reader != null) {

				reader.onload = this.GetThumbnail;
				reader.readAsDataURL(file);
			}


		}
	}

	GetThumbnail(e) {
		const myCan = document.createElement('canvas');
		const img = new Image();
		img.src = e.target.result;
		img.onload = function () {

			myCan.id = 'myTempCanvas';
			const tsize = 100;
			myCan.width = Number(tsize);
			myCan.height = Number(tsize);
			if (myCan.getContext) {
				const cntxt = myCan.getContext('2d');
				cntxt.drawImage(img, 0, 0, myCan.width, myCan.height);
				const dataURL = myCan.toDataURL();


				if (dataURL != null && dataURL !== undefined) {
					const nImg = document.createElement('img');
					nImg.src = dataURL;
					document.getElementById('image-holder').appendChild(nImg);

				} else {
					alert('unable to get context');
				}

			}
		};

	}

	deleteFromContainer(fileUrl, fileType) {
		const fileurl = fileUrl;
		fileUrl = _.replace(fileUrl, 'download', 'files');
		this.http.delete(environment.apiUrl + fileUrl, this.requestHeaderService.options)
			.map((response) => {
				if (fileType === 'video') {
					this.urlForVideo = _.remove(this.urlForVideo, function (n) {
						return n !== fileurl;
					});
					this.workshop.controls.videoUrls.patchValue(this.urlForVideo);
				} else if (fileType === 'image') {
					this.urlForImages = _.remove(this.urlForImages, function (n) {
						return n !== fileurl;
					});
					this.workshop.controls.imageUrls.patchValue(this.urlForImages);
				}
				this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(this.workshop.value, this.sidebarMenuItems);
			}).subscribe();

	}

	deleteFromContainerArr(event, fileType) {
		for (let i = 0; i < event.target.files.length; i++) {
			let file = event.target.files[i];
			const fileurl = file;
			file = _.replace(file, 'download', 'files');
			this.http.delete(environment.apiUrl + file, this.requestHeaderService.options)
				.map((response) => {
					if (fileType === 'video') {
						this.urlForVideo = _.remove(this.urlForVideo, function (n) {
							return n !== fileurl;
						});
						this.workshop.controls.videoUrls.patchValue(this.urlForVideo);
					} else if (fileType === 'image') {
						this.urlForImages = _.remove(this.urlForImages, function (n) {
							return n !== fileurl;
						});
						this.workshop.controls.imageUrls.patchValue(this.urlForImages);
					}
				}).subscribe();

		}
	}

	toggleChoice(choice) {
		this.selectedOption = choice;
	}


	submitPhoneNo(element, text) {
		// Call the OTP service
		// Post Workshop for review

		element.textContent = text;
		this._collectionService.sendVerifySMS(this.phoneDetails.controls.phoneNo.value, this.phoneDetails.controls.countryCode.value)
			.subscribe((res) => {
				this.otpSent = true;
				this.phoneDetails.controls.phoneNo.disable();
				element.textContent = 'OTP Sent';
			});
	}

	submitOTP() {
		this._collectionService.confirmSmsOTP(this.phoneDetails.controls.inputOTP.value)
			.subscribe((res) => {
				this.snackBar.open('Token Verified', 'Close', {
					duration: 5000
				});
				this.step++;
			},
				(error) => {
					this.snackBar.open(error.message, 'Close', {
						duration: 5000
					});
				});
	}

	takeToPayment() {
		this.busyPayment = true;
		this.step++;
		this.router.navigate(['workshop', this.workshopId, 'edit', this.step]);
	}

	/**
	 * Make the dates section of this page editable
	 */
	makeDatesEditable() {
		this.datesEditable = true;
	}

	openWorkshop() {
		this.busyPreview = true;
		this.router.navigate(['/workshop', this.workshopId]);
		this.busyPreview = false;
	}

	sort(calendars, param1, param2) {
		return _.sortBy(calendars, [param1, param2]);
	}

	onFreeChange(event) {
		if (event) {
			this.workshop.controls['price'].setValue(0);
		}
	}

	ngOnDestroy(): void {
		this.mobileQuery.removeListener(this._mobileQueryListener);
	}

	ngAfterViewInit() {
		this.cd.detectChanges();
	}

	back() {
		this.goto(this.step - 1);
	}
	next() {
		this.goto(this.step + 1);
	}

}

