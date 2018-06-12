import 'rxjs/add/operator/switchMap';
import { Component, OnInit, Input, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/publishReplay';
import { Router, ActivatedRoute } from '@angular/router';
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
import { environment } from '../../../environments/environment';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { Observable } from 'rxjs/Observable';
import { TopicService } from '../../_services/topic/topic.service';
import { PaymentService } from '../../_services/payment/payment.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { Meta, Title } from '@angular/platform-browser';
import { ProfileService } from '../../_services/profile/profile.service';

@Component({
	selector: 'app-class-edit',
	templateUrl: './class-edit.component.html',
	styleUrls: ['./class-edit.component.scss']
})

export class ClassEditComponent implements OnInit, AfterViewInit, OnDestroy {
	public busySave = false;
	public busyPreview = false;
	public busyInterest = false;
	public busyLanguage = false;
	public busyBasics = false;
	public busyHost = false;
	public busyClassPage = false;
	public busyPayment = false;
	public sidebarFilePath = 'assets/menu/class-static-left-sidebar-menu.json';
	public sidebarMenuItems;
	public itenariesForMenu = [];
	public envVariable;
	public interest1: FormGroup;
	public newTopic: FormGroup;
	public class: FormGroup;
	public selectedTopic: FormGroup;
	public timeline: FormGroup;
	public conditions: FormGroup;
	public phoneDetails: FormGroup;
	public assessmentForm: FormGroup;
	
	public supplementUrls = new FormArray([]);
	public uploadingImage = false;
	public uploadingVideo = false;
	
	public classId: string;
	public classData: any;
	public isClassActive = false;
	public activeClass = '';
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
	public availableAssessmentTypes = [];
	public availableAssessmentStyles = [];
	public key;
	public maxTopics = 3;
	public otpSent = false;
	
	profileImagePending: Boolean;
	classVideoPending: Boolean;
	classImage1Pending: Boolean;
	classImage2Pending: Boolean;
	
	public step = 1;
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
	public showBackground = false;
	public urlForVideo = [];
	public urlForImages = [];
	
	public datesEditable = false;
	public isPhoneVerified = false;
	public isSubmitted = false;
	public connectPaymentUrl = '';
	private payoutRuleAccountId: string;
	
	filteredLanguageOptions: Observable<string[]>;
	
	public query = {
		'include': [
			'topics',
			'calendars',
			{ 'participants': [{ 'profiles': ['work'] }] },
			{ 'owners': [{ 'profiles': ['phone_numbers'] }] },
			{ 'contents': ['schedules'] },
			'payoutrules',
			{ 'assessment_models': ['assessment_na_rules', 'assessment_rules'] }
		]
	};
	public paymentInfo: FormGroup;
	private payoutRuleNodeId: string;
	public payoutLoading = true;
	public payoutAccounts: Array<any>;
	public freeClass = false;
	public currentDate: Date;
	public mobileQuery: MediaQueryList;
	private _mobileQueryListener: () => void;
	public gyanBalance: number;
	public nAAssessmentParams: Array<string>;
	public maxGyanExceding: boolean;
	totalGyan = 0;
	totalDuration = 0;
	// TypeScript public modifiers
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
		public cd: ChangeDetectorRef,
		private media: MediaMatcher,
		private titleService: Title,
		private metaService: Meta,
		private profileService: ProfileService
	) {
		this.envVariable = environment;
		this.activatedRoute.params.subscribe(params => {
			this.classId = params['collectionId'];
			this.step = Number(params['step']);
			this.showBackground = this.step && this.step.toString() === '5';
			this.connectPaymentUrl = 'https://connect.stripe.com/express/oauth/authorize?response_type=code' +
				'&client_id=' + environment.stripeClientId + '&scope=read_write&redirect_uri=' + environment.clientUrl
				+ '/console/account/payoutmethods&state=' + environment.clientUrl + '/class/' + this.classId
				+ '/edit/' + this.step;
			this.searchTopicURL = environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics/suggest?field=name&query=';
			this.createTopicURL = environment.apiUrl + '/api/' + environment.uniqueDeveloperCode + '_topics';
		});
		
		
		this.userId = _cookieUtilsService.getValue('userId');
		this.currentDate = moment().toDate();
		
	}
	
	public ngOnInit() {
		console.log('Inside oninit class');
		this.setTags();
		this.interest1 = new FormGroup({});
		
		this.newTopic = this._fb.group({
			topicName: ['', Validators.requiredTrue]
		});
		
		this.class = this._fb.group({
			type: 'class',
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
			approvedBy: '',
			canceledBy: '',
			status: 'draft',
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
		
		this.paymentInfo = this._fb.group({
			id: ''
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
		this.initializeClass();
		this._CANVAS = <HTMLCanvasElement>document.querySelector('#video-canvas');
		this._VIDEO = document.querySelector('#main-video');
		this.getGyanBalance();
		
		this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
		this._mobileQueryListener = () => this.cd.detectChanges();
		this.mobileQuery.addListener(this._mobileQueryListener);
		
	}
	
	getGyanBalance() {
		this.gyanBalance = 0;
		this.profileService.getGyanBalance(this.userId, 'fixed').subscribe(res => {
			this.gyanBalance = Number(res);
		});
	}
	
	private setTags() {
		this.titleService.setTitle('Create Class');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Create new class'
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
	
	ngOnDestroy(): void {
		this.mobileQuery.removeListener(this._mobileQueryListener);
	}
	
	ngAfterViewInit() {
		this.cd.detectChanges();
	}
	
	
	private extractDate(dateString: string) {
		return moment.utc(dateString).local().toDate();
	}
	
	private extractTime(dateString: string) {
		const time = moment.utc(dateString).local().format('HH:mm:ss');
		return time;
	}
	
	private initializeTimeLine(res) {
		
		const sortedCalendar = this.sort(res.calendars, 'startDate', 'endDate');
		if (sortedCalendar[0] !== undefined && sortedCalendar[0].startDate) {
			const calendar = sortedCalendar[0];
			calendar['startDate'] = this.extractDate(calendar.startDate);
			calendar['endDate'] = this.extractDate(calendar.endDate);
			this._collectionService.sanitize(calendar);
			
			if (this.classData.status === 'active') {
				this.isClassActive = true;
				this.activeClass = 'disabledMAT';
			}
			this.timeline.controls.calendar.patchValue(calendar);
			this.initializeContentForm(res);
		}
		this.initializeCalendarCheck(res);
		
	}
	private initializeCalendarCheck(classData: any) {
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
	
	public initializeContentForm(res) {
		const contentGroup = <FormGroup>this.timeline.controls.contentGroup;
		const itenary = <FormArray>contentGroup.controls.itenary;
		const itenaries = this.getContents(res.contents);
		for (const key in itenaries) {
			if (itenaries.hasOwnProperty(key)) {
				const itr: FormGroup = this.InitItenary();
				console.log(itr);
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
		console.log(itenary);
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
			// this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(this.class.value, this.sidebarMenuItems);
			// this.sidebarMenuItems[2]['submenu'] = [];
		}
		
		return itenaries;
	}
	
	private initializeFormFields() {
		this.maxGyanExceding = false;
		this.difficulties = ['Beginner', 'Intermediate', 'Advanced'];
		
		this.cancellationPolicies = ['24 Hours', '3 Days', '1 Week'];
		
		this.currencies = ['USD', 'INR', 'GBP'];
		
		this.availableAssessmentTypes = ['Peer', 'Teacher', 'Third Party'];
		
		this.availableAssessmentStyles = ['Grades', 'Percentage', 'Percentile'];
		
		this.nAAssessmentParams = ['engagement', 'commitment'];
		this.learnerType_array = {
			learner_type: [
				{ id: 'auditory', display: 'Auditory' }
				, { id: 'visual', display: 'Visual' }
				, { id: 'read-write', display: 'Read & Write' }
				, { id: 'kinesthetic', display: 'Kinesthetic' }
			]
		};
		
		this.placeholderStringTopic = 'Start typing to to see a list of suggested topics...';
		
		this.key = 'access_token';
		
		this.countryPickerService.getCountries()
			.subscribe((countries) => this.countries = countries);
		
		this.languagePickerService.getLanguages()
			.subscribe((languages) => {
				this.languagesArray = _.map(languages, 'name');
				this.filteredLanguageOptions = this.class.controls.selectedLanguage.valueChanges
					.startWith(null)
					.map(val => val ? this.filter(val) : this.languagesArray.slice());
				console.log(this.filteredLanguageOptions);
			});
		
		if (this.interests.length === 0) {
			this.http.get(environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics', this.requestHeaderService.options)
				.map((response: any) => {
					this.suggestedTopics = response.slice(0, 5);
				}).subscribe();
		} else {
			this.suggestedTopics = this.interests;
		}
		
		this.profileImagePending = true;
		this.classVideoPending = true;
		this.classImage1Pending = true;
		
		this.class.controls['academicGyan'].valueChanges.subscribe(res => {
			this.validateGyan();
		});
		this.class.controls['nonAcademicGyan'].valueChanges.subscribe(res => {
			this.validateGyan();
		});
		this.timeline.valueChanges.subscribe(res => {
			this.totalHours();
		});
	}
	
	validateGyan() {
		this.totalGyan = this.class.controls['academicGyan'].value + this.class.controls['nonAcademicGyan'].value;
		if (this.totalGyan > this.gyanBalance) {
			this.maxGyanExceding = true;
		} else {
			this.maxGyanExceding = false;
		}
	}
	
	filter(val: string): string[] {
		console.log('filtering');
		return this.languagesArray.filter(option =>
			option.toLowerCase().indexOf(val.toLowerCase()) === 0);
	}
	
	private initializeClass() {
		if (this.classId) {
			this._collectionService.getCollectionDetail(this.classId, this.query)
				.subscribe((res) => {
						this.classData = res;
						if (this.classData.payoutrules && this.classData.payoutrules.length > 0) {
							this.payoutRuleNodeId = this.classData.payoutrules[0].id;
							this.payoutRuleAccountId = this.classData.payoutrules[0].payoutId1;
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
			console.log(event);
			this.selectedLanguages = event;
			this.busyLanguage = false;
			// this.class.controls.selectedLanguage.setValue(event.value);
		}
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
				this.http.delete(environment.apiUrl + '/api/collections/' + this.classId + '/topics/rel/' + topic.id, this.requestHeaderService.options)
					.map((response) => {
						console.log(response);
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
			this.class.controls.selectedLanguage.patchValue(res.language[0]);
		}
		// aboutHost TBD
		this.class.controls.aboutHost.patchValue(res.aboutHost);
		
		// Title
		this.class.controls.title.patchValue(res.title);
		
		// Headline
		this.class.controls.headline.patchValue(res.headline);
		
		// Description
		this.class.controls.description.patchValue(res.description);
		
		// Difficulty Level
		this.class.controls.difficultyLevel.patchValue(res.difficultyLevel);
		
		// Notes
		this.class.controls.notes.patchValue(res.notes);
		
		// Seats
		this.class.controls.maxSpots.patchValue(res.maxSpots);
		
		// Photos and Videos
		if (res.videoUrls && res.videoUrls.length > 0) {
			this.class.controls['videoUrls'].patchValue(res.videoUrls);
			this.urlForVideo = res.videoUrls;
		}
		if (res.imageUrls && res.imageUrls.length > 0) {
			this.class.controls['imageUrls'].patchValue(res.imageUrls);
			this.urlForImages = res.imageUrls;
		}
		
		// Currency, Amount, Cancellation Policy
		this.class.controls.price.patchValue(res.price);
		if (res.price === 0) {
			this.freeClass = true;
		}
		if (res.currency) {this.class.controls.currency.patchValue(res.currency); }
		if (res.cancellationPolicy) {this.class.controls.cancellationPolicy.setValue(res.cancellationPolicy); }
		
		// Status
		this.class.controls.status.setValue(res.status);
		
		// Gyan
		this.class.controls['academicGyan'].patchValue(res.academicGyan);
		
		this.class.controls['nonAcademicGyan'].patchValue(res.nonAcademicGyan);
		
		
		this.isPhoneVerified = res.owners[0].phoneVerified;
		
		this.isSubmitted = this.class.controls.status.value === 'submitted';
		
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
	public classStepUpdate() {
		if (this.class.value.stage < this.step) {
			this.class.patchValue({
				'stage': this.step
			});
		}
		
	}
	
	public addImageUrl(value: String) {
		console.log('Adding image url: ' + value);
		this.urlForImages.push(value);
		const control = <FormArray>this.class.controls['imageUrls'];
		this.classImage1Pending = false;
		control.patchValue(this.urlForImages);
		const tempClassData = this.classData;
		tempClassData.imageUrls = this.class.controls['imageUrls'].value;
		this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(tempClassData, this.sidebarMenuItems);
	}
	
	public addVideoUrl(value: String) {
		console.log('Adding video url: ' + value);
		this.urlForVideo.push(value);
		const control = this.class.controls['videoUrls'];
		this.classVideoPending = false;
		control.patchValue(this.urlForVideo);
		const tempClassData = this.classData;
		tempClassData.videoUrls = this.class.controls['videoUrls'].value;
		this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(tempClassData, this.sidebarMenuItems);
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
				this.snackBar.open(err.message, 'Close', {
					duration: 5000
				});
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
	
	public submitClass(data, timeline?, step?) {
		if (this.calendarIsValid(step)) {
			switch (Number(this.step)) {
				case 11:
					this.totalGyan = this.class.controls['academicGyan'].value + this.class.controls['nonAcademicGyan'].value;
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
					if ((this.totalGyan > this.gyanBalance) && (this.totalDuration !== this.totalGyan)) {
						this.snackBar.open('You do not have enough Gyan balance or learning hours to justify a knowledge value of ' + this.totalGyan + ' Gyan. Knowledge value for this class will be adjusted to ' + this.totalDuration + ' Gyan.',
							'Ok').onAction().subscribe(result => {
								data.controls['academicGyan'].patchValue(this.totalDuration >= 2 ? this.totalDuration - 1 : 1);
								data.controls['nonAcademicGyan'].patchValue(1);
								this.totalGyan = this.class.controls['academicGyan'].value + this.class.controls['nonAcademicGyan'].value;
								if (this.classHasOnlineContent(timeline)) {
									this.checkStatusAndSubmit(data, timeline, step);
								}
						});
					} else {
						if (this.classHasOnlineContent(timeline)) {
							this.checkStatusAndSubmit(data, timeline, step);
						}
					}
					break;
				default:
					this.checkStatusAndSubmit(data, timeline, this.step);
					break;
			}
		}
	}
	
	private checkStatusAndSubmit(data, timeline?, step?) {
		if (this.class.controls.status.value === 'active') {
			this.dialogsService.openCollectionCloneDialog({type: 'class'})
				.subscribe((result) => {
					if (result === 'accept') {
						this.executeSubmitClass(data, timeline, this.step);
					} else if (result === 'reject') {
						this.router.navigate(['/console/teaching/classes']);
					}
				});
		} else {
			this.executeSubmitClass(data, timeline, step);
		}
	}
	
	private totalHours(): void {
		let totalLength = 0;
		this.timeline.value.contentGroup.itenary.forEach((itenaryObj: any) => {
			itenaryObj.contents.forEach(contentObj => {
				if (contentObj.type === 'online' && contentObj.schedule && contentObj.schedule.startTime && contentObj.schedule.endTime && contentObj.schedule.startTime !== '' && contentObj.schedule.endTime !== '') {
					let startMoment, endMoment, contentLength;
					if (moment(contentObj.schedule.startTime).isValid()) {
						startMoment = moment(contentObj.schedule.startTime);
						endMoment = moment(contentObj.schedule.endTime);
					} else {
						startMoment = moment('01-02-1990 ' + contentObj.schedule.startTime);
						endMoment = moment('01-02-1990 ' + contentObj.schedule.endTime);
					}
					contentLength = moment.utc(endMoment.diff(startMoment)).format('HH');
					totalLength += parseInt(contentLength, 10);
				} else if (contentObj.type === 'video' && contentObj.videoLength) {
					totalLength += Math.round(contentObj.videoLength / 3600);
				}
			});
		});
		this.totalDuration = totalLength;
	}
	
	private calendarIsValid(step) {
		if (step !== 14) {
			// Skip calendar validation for all steps except timeline
			return true;
		}
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
	
	private executeSubmitClass(data, timeline?, step?) {
		const lang = <FormArray>this.class.controls.language;
		lang.removeAt(0);
		lang.push(this._fb.control(data.value.selectedLanguage));
		const body = data.value;
		delete body.selectedLanguage;
		
		this._collectionService.patchCollection(this.classId, body).subscribe(
			(response: any) => {
				const result = response;
				let collectionId;
				if (result.isNewInstance) {
					this.class.controls.status.setValue(result.status);
					collectionId = result.id;
				} else {
					collectionId = this.classId;
				}
				result.topics = this.classData.topics;
				result.contents = this.classData.contents;
				result.owners = this.classData.owners;
				this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(result, this.sidebarMenuItems);
				
				if (step && step === 14) {
					this.submitTimeline(collectionId, timeline);
				} else {
					this.step++;
					this.classStepUpdate();
					this.router.navigate(['class', collectionId, 'edit', this.step]);
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
		const itinerary = data.controls.contentGroup.value.itenary;
		if (body.startDate && body.endDate && itinerary && itinerary.length > 0) {
			this.http.patch(environment.apiUrl + '/api/collections/' + collectionId + '/calendar', body, this.requestHeaderService.options)
				.subscribe((response) => {
					this.step++;
					this.classStepUpdate();
					this.router.navigate(['class', collectionId, 'edit', this.step]);
				});
		} else {
			console.log('No date selected or no content added to itinerary! - ' + JSON.stringify(itinerary));
			if (!itinerary || itinerary.length === 0) {
				this.snackBar.open('You need to add at least 1 activity to your class to proceed.', 'Close', {
					duration: 5000
				});
			} else {
				this.snackBar.open('No dates have been selected for your class.', 'Close', {
					duration: 5000
				});
			}
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
		console.log(topicArray);
		body = {
			'targetIds': topicArray
		};
		
		if (topicArray.length !== 0) {
			let observable: Observable<any>;
			observable = this.http.patch(environment.apiUrl + '/api/collections/' + this.classId + '/topics/rel', body, this.requestHeaderService.options)
				.map(response => response).publishReplay().refCount();
			observable.subscribe((res) => {
				this._collectionService.getCollectionDetail(this.classId, this.query)
					.subscribe((resData) => {
						this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(resData, this.sidebarMenuItems);
					});
				this.step++;
				this.classStepUpdate();
				this.busyInterest = false;
				this.router.navigate(['class', this.classId, 'edit', this.step]);
			});
		} else {
			this.step++;
			this.classStepUpdate();
			this.router.navigate(['class', this.classId, 'edit', this.step]);
		}
	}
	
	/**
	 * goto(toggleStep)  */
	public goto(toggleStep) {
		this.busyBasics = false;
		this.busyClassPage = false;
		this.step = toggleStep;
		this.router.navigate(['class', this.classId, 'edit', +toggleStep]);
		if (toggleStep === 2) {
			this.busyBasics = true;
			this.busyBasics = false;
		}
		this.showBackground = !!(this.step && this.step.toString() === '5');
		
		if (toggleStep === 6) {
			this.busyClassPage = true;
		}
	}
	
	
	
	submitForReview() {
		// Post Class for review
		this._collectionService.submitForReview(this.classId)
			.subscribe((res) => {
				this.class.controls.status.setValue('submitted');
				this.isSubmitted = true;
				this.dialogsService.openCollectionSubmitDialog({type: 'class'});
				// call to get status of class
				if (this.class.controls.status.value === 'active') {
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
		this.classStepUpdate();
		if (this.step === 14) {
			const data = this.timeline;
			const body = data.value.calendar;
			if (body.startDate && body.endDate) {
				this.http.patch(environment.apiUrl + '/api/collections/' + this.classId + '/calendar', body, this.requestHeaderService.options)
					.map((response) => {
						this.busySave = false;
						this.router.navigate(['console/teaching/classes']);
					})
					.subscribe();
			} else {
				console.log('Enter Date!');
			}
			
		} else {
			const data = this.class;
			const lang = <FormArray>this.class.controls.language;
			lang.removeAt(0);
			lang.push(this._fb.control(data.value.selectedLanguage));
			const body = data.value;
			delete body.selectedLanguage;
			this._collectionService.patchCollection(this.classId, body).map(
				(response) => {
					this.router.navigate(['console/teaching/classes']);
				}).subscribe();
		}
	}
	
	exit() {
		this.router.navigate(['console/teaching/classes']);
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
					this.class.controls.selectedLanguage.patchValue(res.name);
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
				console.log(response);
				if (fileType === 'video') {
					this.urlForVideo = _.remove(this.urlForVideo, function (n) {
						return n !== fileurl;
					});
					this.class.controls.videoUrls.patchValue(this.urlForVideo);
				} else if (fileType === 'image') {
					this.urlForImages = _.remove(this.urlForImages, function (n) {
						return n !== fileurl;
					});
					this.class.controls.imageUrls.patchValue(this.urlForImages);
				}
				this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(this.class.value, this.sidebarMenuItems);
			}).subscribe();
		
	}
	
	deleteFromContainerArr(event, fileType) {
		for (let i = 0; i < event.target.files.length; i++) {
			let file = event.target.files[i];
			const fileurl = file;
			file = _.replace(file, 'download', 'files');
			this.http.delete(environment.apiUrl + file, this.requestHeaderService.options)
				.map((response) => {
					console.log(response);
					if (fileType === 'video') {
						this.urlForVideo = _.remove(this.urlForVideo, function (n) {
							return n !== fileurl;
						});
						this.class.controls.videoUrls.patchValue(this.urlForVideo);
					} else if (fileType === 'image') {
						this.urlForImages = _.remove(this.urlForImages, function (n) {
							return n !== fileurl;
						});
						this.class.controls.imageUrls.patchValue(this.urlForImages);
					}
				}).subscribe();
			
		}
	}
	
	toggleChoice(choice) {
		this.selectedOption = choice;
	}
	
	
	submitPhoneNo(element, text) {
		// Call the OTP service
		// Post Class for review
		
		element.textContent = text;
		this._collectionService.sendVerifySMS(this.phoneDetails.controls.phoneNo.value, this.phoneDetails.controls.countryCode.value)
			.subscribe((res) => {
				this.otpSent = true;
				this.phoneDetails.controls.phoneNo.disable();
				this.phoneDetails.controls.countryCode.disable();
				element.textContent = 'Verification code sent';
			});
	}
	
	submitOTP() {
		this._collectionService.confirmSmsOTP(this.phoneDetails.controls.inputOTP.value)
			.subscribe((res) => {
					console.log(res);
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
		this.router.navigate(['class', this.classId, 'edit', this.step]);
	}
	
	/**
	 * Make the dates section of this page editable
	 */
	makeDatesEditable() {
		this.datesEditable = true;
	}
	
	openClass() {
		this.busyPreview = true;
		this.router.navigate(['/class', this.classId]);
		this.busyPreview = false;
	}
	
	sort(calendars, param1, param2) {
		return _.sortBy(calendars, [param1, param2]);
	}
	
	private retrieveAccounts() {
		this.payoutAccounts = [];
		this._paymentService.retrieveConnectedAccount().subscribe(result => {
			console.log(result);
			if (result.length > 0) {
				this.payoutAccounts = result;
				this.payoutAccounts.forEach(account => {
					if (this.payoutRuleNodeId && this.payoutRuleAccountId && account.payoutaccount.id === this.payoutRuleAccountId) {
						this.paymentInfo.controls['id'].patchValue(this.payoutRuleAccountId);
					}
				});
			}
			this.paymentInfo.controls['id'].valueChanges.subscribe(res => {
				this.updatePayoutRule(res);
			});
			
			this.payoutLoading = false;
		}, err => {
			console.log(err);
			this.payoutLoading = false;
		});
	}
	
	private updatePayoutRule(newPayoutId) {
		if (this.payoutRuleNodeId) {
			this.payoutLoading = true;
			this._paymentService.patchPayoutRule(this.payoutRuleNodeId, newPayoutId).subscribe(res => {
				if (res) {
					this.payoutLoading = false;
					this.payoutRuleAccountId = newPayoutId;
					this.snackBar.open('Payout Account Updated', 'Close', {
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
			this._paymentService.postPayoutRule(this.classId, newPayoutId).subscribe((res: any) => {
				if (res) {
					this.payoutLoading = false;
					this.payoutRuleAccountId = newPayoutId;
					this.snackBar.open('Payout Account Added', 'Close', {
						duration: 5000
					});
					this.payoutRuleNodeId = res.id;
				}
			}, err => {
				this.payoutLoading = false;
				this.snackBar.open('Unable to Add account', 'Close', {
					duration: 5000
				});
			});
			
		}
	}
	
	onFreeChange(event) {
		if (event) {
			this.class.controls['price'].setValue(0);
		}
	}
	
	back() {
		this.goto(this.step - 1);
	}
	
	next() {
		this.goto(this.step + 1);
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
		this._collectionService.updateAssessmentModel(this.classId, {
			type: this.assessmentForm.controls['type'].value,
			style: this.assessmentForm.controls['style'].value
		}).flatMap(res => {
			console.log(res);
			assessmentModelObject = <any>res;
			this.classData.assessment_models = [assessmentModelObject];
			return this._collectionService.updateAssessmentRules(assessmentModelObject.id, this.assessmentForm.controls['rules'].value);
		}).flatMap(res => {
			this.classData.assessment_models[0].assessment_rules = res;
			return this._collectionService.updateNAAssessmentRules(assessmentModelObject.id, this.assessmentForm.controls['nARules'].value);
		}).subscribe(res => {
			this.classData.assessment_models[0].assessment_na_rules = res;
			this._leftSideBarService.updateSideMenu(this.classData, this.sidebarMenuItems);
			this.step++;
			this.classStepUpdate();
			this.router.navigate(['class', this.classId, 'edit', this.step]);
		}, err => {
			console.log(err);
			this.snackBar.open('An error occurred', 'close', {
				duration: 5000
			});
		});
	}
	
	public classHasOnlineContent(timeline: any) {
		if (timeline) {
			let classValid = false;
			for (const ItennaryObj of timeline.value.contentGroup.itenary) {
				for (const contentObj of ItennaryObj.contents) {
					if (contentObj.type.toString() === 'online') {
						classValid = true;
						return true;
					}
				}
			}
			this.snackBar.open('Class should contain at least 1 online session!', 'Close', {
				duration: 5000
			});
		}
		return false;
	}
	
}

