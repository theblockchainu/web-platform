
import { Component, OnInit, OnDestroy, Input, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators, ValidatorFn } from '@angular/forms';
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
import { environment } from '../../../environments/environment';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { Observable, merge } from 'rxjs';
import { TopicService } from '../../_services/topic/topic.service';
import { PaymentService } from '../../_services/payment/payment.service';
import { DataSharingService } from '../../_services/data-sharing-service/data-sharing.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { Meta, Title } from '@angular/platform-browser';
import { ProfileService } from '../../_services/profile/profile.service';
import { CertificateService } from '../../_services/certificate/certificate.service';
import { CustomCertificateFormComponent } from '../../_shared/custom-certificate-form/custom-certificate-form.component';
import { AssessmentService } from '../../_services/assessment/assessment.service';
import { flatMap, startWith, map, subscribeOn } from 'rxjs/operators';
@Component({
	selector: 'app-guide-edit',
	templateUrl: './guide-edit.component.html',
	styleUrls: ['./guide-edit.component.scss']
})

export class GuideEditComponent implements OnInit, AfterViewInit, OnDestroy {
	public busySave = false;
	public busyInterest = false;
	public envVariable;
	public busyPayment = false;
	public busySavingData = false;


	public sidebarFilePath = 'assets/menu/guide-static-left-sidebar-menu.json';

	public sidebarMenuItems;
	public itenariesForMenu = [];

	public interest1: FormGroup;
	public newTopic: FormGroup;
	public guide: FormGroup;
	public selectedTopic: FormGroup;
	public timeline: FormGroup;
	public conditions: FormGroup;
	public phoneDetails: FormGroup;
	public paymentInfo: FormGroup;
	public assessmentForm: FormGroup;
	public certificateForm: FormGroup;

	public supplementUrls = new FormArray([]);
	public uploadingImage = false;
	public uploadingVideo = false;

	public guideId: string;
	public guideData: any;
	public isGuideActive = false;
	public activeGuide = '';
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
	guideVideoPending: Boolean;
	guideImage1Pending: Boolean;
	guideImage2Pending: Boolean;

	public step = 1;
	public max = 14;
	public learnerType_array;
	public selectedLanguages;
	public suggestedTopics = [];
	public interests = [];
	public originalInterests = [];

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
	certificateLoaded: boolean;
	public query = {
		'include': [
			'topics',
			'calendars',
			{ 'participants': [{ 'profiles': ['work'] }] },
			{ 'owners': [{ 'profiles': ['phone_numbers'] }] },
			{ 'contents': ['schedules', 'locations'] },
			'payoutrules',
			{ 'assessment_models': ['assessment_na_rules', 'assessment_rules'] },
		]
	};

	private payoutRuleNodeId: string;
	public payoutLoading = true;
	public payoutAccounts: Array<any>;
	public freeGuide = false;
	public currentDate: Date;
	public mobileQuery: MediaQueryList;
	private _mobileQueryListener: () => void;
	public gyanBalance: number;
	public nAAssessmentParams: Array<string>;
	public maxGyanExceding: boolean;
	totalGyan = 0;
	totalDuration = 0;
	timelineStep = 16;
	exitAfterSave = false;
	@ViewChild('certificateComponent') certificateComponent: CustomCertificateFormComponent;
	defaultAssesment: any;
	availableDefaultAssessments: Array<AssessmentTypeData>;
	availableSubtypes: Array<SubTypeInterface>;
	uploadProgress: number;
	public editorOptions: any = {
		'hideIcons': ['FullScreen']
	};
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
		private _dataSharingService: DataSharingService,
		private media: MediaMatcher,
		private titleService: Title,
		private metaService: Meta,
		private profileService: ProfileService,
		private certificateService: CertificateService,
		private assesmentService: AssessmentService
	) {
		this.envVariable = environment;
		this.activatedRoute.params.subscribe(params => {
			this.guideId = params['collectionId'];
			this.step = Number(params['step']);
			this.showBackground = this.step && this.step.toString() === '6';
			this.connectPaymentUrl = 'https://connect.stripe.com/express/oauth/authorize?response_type=code' +
				'&client_id=' + environment.stripeClientId + '&scope=read_write&redirect_uri=' + environment.clientUrl
				+ '/console/account/payoutmethods&state=' + environment.clientUrl + '/guide/' + this.guideId
				+ '/edit/' + this.step;
			this.searchTopicURL = environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics/suggest?field=name&query=';
			this.createTopicURL = environment.apiUrl + '/api/topics';
		});


		this.userId = _cookieUtilsService.getValue('userId');
		this.currentDate = moment().toDate();

	}

	public ngOnInit() {
		console.log('Inside oninit guide');
		this.setTags();
		this.interest1 = new FormGroup({});

		this.newTopic = this._fb.group({
			topicName: ['', Validators.required]
		});

		this.guide = this._fb.group({
			type: 'guide',
			title: '',
			stage: '',
			language: this._fb.array([]),
			selectedLanguage: '',
			headline: '',
			description: [null, Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(2000)])],
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
			nonAcademicGyan: 1,
			subCategory: ''
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

		this.timeline.valueChanges.subscribe(res => {
			this._dataSharingService.data = this.timeline.value;
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
			type: ['Teacher', Validators.required],
			style: ['Grades', Validators.required],
			rules: this._fb.array([]),
			nARules: this._fb.array([
				this._fb.group({
					value: ['engagement', Validators.required],
					gyan: [50, [Validators.required, Validators.max(100), Validators.min(1), this.changeControl(1)]]
				}),
				this._fb.group({
					value: ['commitment', Validators.required],
					gyan: [50, [Validators.required, Validators.max(100), Validators.min(1)]]
				})
			])
		});

		this.certificateForm = this._fb.group({
			certificateHTML: [''],
			expiryDate: [''],
			formData: [null]
		});

		this.initializeFormFields();
		this.initializeGuide();
		if (this._cookieUtilsService.isBrowser) {
			this._CANVAS = <HTMLCanvasElement>document.querySelector('#video-canvas');
			this._VIDEO = document.querySelector('#main-video');
			this.mobileQuery = this.media.matchMedia('(max-width: 600px)');
			this._mobileQueryListener = () => this.cd.detectChanges();
			this.mobileQuery.addListener(this._mobileQueryListener);
		}
		this.getGyanBalance();



	}

	getGyanBalance() {
		this.gyanBalance = 0;
		this.profileService.getGyanBalance(this.userId, 'fixed').subscribe(res => {
			this.gyanBalance = Number(res);
		});
	}

	private setTags() {
		this.titleService.setTitle('Create Guide');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Create new guide'
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'theblockchainu.com'
		});
		this.metaService.updateTag({
			property: 'og:image',
			content: 'https://theblockchainu.com/bu_logo_square.png'
		});
		this.metaService.updateTag({
			property: 'og:url',
			content: environment.clientUrl + this.router.url
		});
	}

	private initializeAssessment(result) {
		if (result.assessment_models[0]) {
			// this.assessmentForm.controls['type'].patchValue(result.assessment_models[0].type);
			this.assessmentForm.controls['style'].patchValue(result.assessment_models[0].style);
			if (result.assessment_models[0].assessment_rules && result.assessment_models[0].assessment_rules.length > 0) {
				const rulesArray = <FormArray>this.assessmentForm.controls['rules'];
				rulesArray.removeAt(0);
				result.assessment_models[0].assessment_rules.forEach(rule => {
					rulesArray.push(this._fb.group({
						value: rule.value,
						gyan: [rule.gyan, [Validators.max(100), Validators.min(1)]]
					}));
				});
			}
			const nARulesArray = <FormArray>this.assessmentForm.controls['nARules'];
			if (result.assessment_models[0].assessment_na_rules && result.assessment_models[0].assessment_na_rules.length > 0) {
				nARulesArray.removeAt(0);
				nARulesArray.removeAt(0);
				result.assessment_models[0].assessment_na_rules.forEach(rule => {
					if (nARulesArray.length === 0) {
						nARulesArray.push(this._fb.group({
							value: [rule.value],
							gyan: [rule.gyan, [Validators.max(100), Validators.min(1), this.changeControl(1)]]
						}));
					} else {
						nARulesArray.push(this._fb.group({
							value: [rule.value],
							gyan: [rule.gyan, [Validators.max(100), Validators.min(1)]]
						}));
					}
				});
			}
		}
	}

	ngOnDestroy(): void {
		if (this.mobileQuery) {
			this.mobileQuery.removeListener(this._mobileQueryListener);
		}
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

			if (this.guideData.status === 'active') {
				this.isGuideActive = true;
				this.activeGuide = 'disabledMAT';
			}
			this.timeline.controls.calendar.patchValue(calendar);
			this.initializeContentForm(res);
		}
		this.initializeCalendarCheck(res);

	}
	private initializeCalendarCheck(guideData: any) {
		const calendarForm = <FormGroup>this.timeline.controls['calendar'];
		const contentGroup = <FormGroup>this.timeline.controls.contentGroup;
		const itenariesArray = <FormArray>contentGroup.controls['itenary'];
		calendarForm.valueChanges.subscribe(res => {
			const contentGroupForm = <FormGroup>this.timeline.controls['contentGroup'];
			const itenaryArray = <FormArray>contentGroupForm.controls['itenary'];
			if (this.step.toString() === this.timelineStep + '' && this.timeline) {
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
			location: this._fb.group({
				location_name: [''],
				country: [null],
				street_address: [null],
				apt_suite: [null],
				city: [null],
				state: [null],
				zip: [null],
				map_lat: [null],
				map_lng: [null]
			}),
			pending: ['']
		});
	}

	public getContents(contents) {
		const itenaries = {};
		for (const contentObj of contents) {
			contentObj.schedule = contentObj.schedules[0];
			contentObj.location = contentObj.locations[0];
			delete contentObj.schedules;
			delete contentObj.locations;
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
			this.itenariesForMenu.forEach((item) => {
				const index = i;
				this.sidebarMenuItems[2]['submenu'].push({
					'title': 'Day ' + index,
					'step': this.timelineStep + '_' + index,
					'active': false,
					'visible': true,
					'locked': false,
					'complete': false
				});
				i++;
			}, this);
		} else {
			// this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(this.guide.value, this.sidebarMenuItems);
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

		this.availableSubtypes = [
			{ name: 'lab', pic_url: '/assets/images/class_icon2.jpg', description: '' }];

		this.placeholderStringTopic = 'Start typing to to see a list of suggested topics...';

		this.key = 'access_token';

		this.availableDefaultAssessments = this.assesmentService.getAvailableAssessments();

		this.countryPickerService.getCountries()
			.subscribe((countries: any) => this.countries = countries);

		this.languagePickerService.getLanguages()
			.subscribe((languages) => {
				this.languagesArray = _.map(languages, 'name');
				this.filteredLanguageOptions = this.guide.controls.selectedLanguage.valueChanges
					.pipe(startWith(null),
						map(val => val ? this.filter(val) : this.languagesArray.slice()))
					;
				console.log(this.filteredLanguageOptions);
			});

		if (this.interests.length === 0) {
			this.http.get(environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics', this.requestHeaderService.options)
				.subscribe((response: any) => {
					this.suggestedTopics = response.slice(0, 5);
				});
		} else {
			this.suggestedTopics = this.interests;
		}

		this.profileImagePending = true;
		this.guideVideoPending = true;
		this.guideImage1Pending = true;

		// this.guide.controls['academicGyan'].valueChanges.subscribe(res => {
		// 	this.validateGyan();
		// });
		// this.guide.controls['nonAcademicGyan'].valueChanges.subscribe(res => {
		// 	this.validateGyan();
		// });
		this.timeline.valueChanges.subscribe(res => {
			this.totalHours();
		});
	}

	validateGyan() {
		this.totalGyan = this.guide.controls['academicGyan'].value + this.guide.controls['nonAcademicGyan'].value;
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

	private initializeGuide() {
		console.log('Inside init guide');
		if (this.guideId) {
			this._collectionService.getCollectionDetail(this.guideId, this.query)
				.subscribe((res: any) => {
					console.log(res);
					this.guideData = res;
					if (this.guideData.payoutrules && this.guideData.payoutrules.length > 0) {
						this.payoutRuleNodeId = this.guideData.payoutrules[0].id;
						this.payoutRuleAccountId = this.guideData.payoutrules[0].payoutId1;
					}
					this.retrieveAccounts();
					this.initializeFormValues(res);
					this.initializeTimeLine(res);
					this.initializeAssessment(res);
					this.initializeCertificate();
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

	initializeCertificate() {
		this.certificateService.getCertificateTemplate(this.guideId).subscribe((res: any) => {
			this.sidebarMenuItems = this._leftSideBarService.updateSideMenuCertificate(res, this.sidebarMenuItems);
			if (res && res.formData) {
				this.certificateForm.controls['formData'].patchValue(JSON.parse(res.formData));
			}
			if (res && res.expiryDate) {
				this.certificateForm.controls['expiryDate'].patchValue(res.expiryDate);
			}
			this.certificateLoaded = true;
		}, err => {
			console.log(err);
		});
	}

	public languageChange(event) {
		if (event) {
			this.selectedLanguages = event;
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

	public daysCollection(event) {
		this.days = event;
		this.sidebarMenuItems[2]['submenu'] = [];
		this.days.controls.forEach((item, index) => {
			const index2 = +index + 1;
			this.sidebarMenuItems[2]['submenu'].push({
				'title': 'Day ' + index2,
				'step': this.timelineStep + '_' + index2,
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
			this.suggestedTopics = _.cloneDeep(this.interests);
			this.originalInterests = _.cloneDeep(this.interests);
		}
		// Language
		if (res.language && res.language.length > 0) {
			this.selectedLanguages = res.language[0];
			this.guide.controls.selectedLanguage.patchValue(res.language[0]);
		}
		// aboutHost TBD
		this.guide.controls.aboutHost.patchValue(res.aboutHost);

		// Title
		this.guide.controls.title.patchValue(res.title);

		// Headline
		this.guide.controls.headline.patchValue(res.headline);

		// Description
		this.guide.controls.description.patchValue(res.description);

		// Difficulty Level
		this.guide.controls.difficultyLevel.patchValue(res.difficultyLevel);

		// Notes
		this.guide.controls.notes.patchValue(res.notes);

		// Seats
		this.guide.controls.maxSpots.patchValue(res.maxSpots);

		// Photos and Videos
		if (res.videoUrls && res.videoUrls.length > 0) {
			this.guide.controls['videoUrls'].patchValue(res.videoUrls);
			this.urlForVideo = res.videoUrls;
		}
		if (res.imageUrls && res.imageUrls.length > 0) {
			this.guide.controls['imageUrls'].patchValue(res.imageUrls);
			this.urlForImages = res.imageUrls;
		}

		// Currency, Amount, Cancellation Policy
		if (res.price === 0) {
			this.freeGuide = true;
			this.guide.controls.price.patchValue(0);
		} else {
			this.guide.controls.price.patchValue(res.price);
		}
		if (res.currency) { this.guide.controls.currency.patchValue(res.currency); }
		if (res.cancellationPolicy) { this.guide.controls.cancellationPolicy.setValue(res.cancellationPolicy); }

		// Status
		this.guide.controls.status.setValue(res.status);

		// Gyan
		this.guide.controls['academicGyan'].patchValue(res.academicGyan);

		this.guide.controls['nonAcademicGyan'].patchValue(res.nonAcademicGyan);

		this.guide.controls['subCategory'].patchValue(res.subCategory);


		this.isPhoneVerified = res.owners[0].phoneVerified;

		this.isSubmitted = this.guide.controls.status.value === 'submitted';

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

	public guideStepUpdate() {
		if (this.guide.value.stage < this.step) {
			this.guide.patchValue({
				'stage': this.step
			});
		}

	}

	public addImageUrl(value: String) {
		console.log('Adding image url: ' + value);
		this.urlForImages.push(value);
		const control = <FormArray>this.guide.controls['imageUrls'];
		this.guideImage1Pending = false;
		control.patchValue(this.urlForImages);
		const tempGuideData = this.guideData;
		tempGuideData.imageUrls = this.guide.controls['imageUrls'].value;
		this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(tempGuideData, this.sidebarMenuItems);

	}

	public addVideoUrl(value: String) {
		console.log('Adding video url: ' + value);
		this.urlForVideo.push(value);
		const control = this.guide.controls['videoUrls'];
		this.guideVideoPending = false;
		control.patchValue(this.urlForVideo);
		const tempGuideData = this.guideData;
		tempGuideData.videoUrls = this.guide.controls['videoUrls'].value;
		this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(tempGuideData, this.sidebarMenuItems);
	}

	uploadImage(event) {
		this.uploadingImage = true;
		for (const file of event.files) {
			this.mediaUploader.upload(file).subscribe((response: any) => {
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

	public submitGuideTimeline() {
		this.busySavingData = true;
		if (this.calendarIsValid(this.step)) {
			this.guide.controls['academicGyan'].patchValue(this.totalDuration >= 2 ? this.totalDuration - 1 : 1);
			this.guide.controls['nonAcademicGyan'].patchValue(1);
			this.totalGyan = this.guide.controls['academicGyan'].value + this.guide.controls['nonAcademicGyan'].value;
			this.checkStatusAndSubmit(this.guide, this.timeline, this.step);
		}
	}

	public submitGuideGyan() {
		this.busySavingData = true;
		this.totalGyan = this.guide.controls['academicGyan'].value + this.guide.controls['nonAcademicGyan'].value;
		console.log(this.totalGyan);
		console.log(this.gyanBalance);
		if (this.totalGyan > this.gyanBalance) {
			this.dialogsService.showGyanNotif(this.gyanBalance, this.totalGyan).subscribe(res => {
				if (res) {
					this.checkStatusAndSubmit(this.guide, this.timeline, this.step);
				} else {
					this.busySavingData = false;
				}
			});
		} else {
			this.checkStatusAndSubmit(this.guide, this.timeline, this.step);
		}
	}

	public submitGuide() {
		this.busySavingData = true;
		this.checkStatusAndSubmit(this.guide, this.timeline, this.step);
	}

	public submitCertificate(certificate: any) {
		this.busySavingData = true;
		this.certificateForm.controls['certificateHTML'].patchValue(certificate.htmlData);
		this.certificateForm.controls['formData'].patchValue(JSON.stringify(certificate.formData));
		this.certificateForm.controls['expiryDate'].patchValue(certificate.expiryDate);
		this._collectionService.submitCertificate(this.guideId, this.certificateForm.value).subscribe(res => {
			this.sidebarMenuItems = this._leftSideBarService.updateSideMenuCertificate(res, this.sidebarMenuItems);
			if (this.exitAfterSave) {
				this.exit();
			} else {
				this.step++;
				this.guideStepUpdate();
				this.router.navigate(['guide', this.guideId, 'edit', this.step]);
				this.busySavingData = false;
			}
		}, err => {
			this.snackBar.open('An Error Occurred', 'Retry', {
				duration: 3000
			}).onAction().subscribe(res => {
				this.submitCertificate(certificate);
			});
		});
	}

	private checkStatusAndSubmit(data, timeline?, step?) {
		if (this.guide.controls.status.value === 'active') {
			this.dialogsService.openCollectionCloneDialog({ type: 'guide' })
				.subscribe((result) => {
					if (result === 'accept') {
						this.executeSubmitGuide(data, timeline, this.step);
					} else if (result === 'reject') {
						this.router.navigate(['/console/teaching/guides']);
					}
				});
		} else {
			this.executeSubmitGuide(data, timeline, step);
		}
	}

	private totalHours(): void {
		let totalLength = 0;
		this.timeline.value.contentGroup.itenary.forEach((itenaryObj: any) => {
			itenaryObj.contents.forEach(contentObj => {
				if (contentObj.type === 'in-person' && contentObj.schedule && contentObj.schedule.startTime && contentObj.schedule.endTime && contentObj.schedule.startTime !== '' && contentObj.schedule.endTime !== '') {
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
				}
			});
		});
		this.totalDuration = totalLength;
		this.totalGyan = totalLength;
		this.guide.controls['academicGyan'].patchValue(totalLength);
		this.guide.controls['totalHours'].patchValue(totalLength);
	}

	private calendarIsValid(step) {
		const calendarGroup = <FormGroup>this.timeline.controls['calendar'];
		const startMoment = moment(calendarGroup.controls['startDate'].value).local();
		const endMoment = moment(calendarGroup.controls['endDate'].value).local();
		if (startMoment.diff(endMoment) > 0) {
			this.snackBar.open('Start date cannot be after end date!', 'Close', {
				duration: 5000
			});
			return false;
		}
		console.log(startMoment.diff(moment(), 'days'));
		if (startMoment.diff(moment(), 'days') < 0) {
			this.busySavingData = false;
			this.snackBar.open('Start date cannot be in the past!', 'Close', {
				duration: 5000
			});
			return false;
		}
		return true;
	}

	private executeSubmitGuide(data, timeline?, step?) {
		const lang = <FormArray>this.guide.controls.language;
		lang.removeAt(0);
		lang.push(this._fb.control(data.value.selectedLanguage));
		const body = data.value;
		delete body.selectedLanguage;
		this._collectionService.patchCollection(this.guideId, body).subscribe(
			(response: any) => {
				const result = response;
				let collectionId;
				if (result.isNewInstance) {
					this.guide.controls.status.setValue(result.status);
					collectionId = result.id;
				} else {
					collectionId = this.guideId;
				}
				result.topics = this.guideData.topics;
				result.contents = this.guideData.contents;
				result.owners = this.guideData.owners;
				console.log('Sidebar updating');
				this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(result, this.sidebarMenuItems);
				console.log('Sidebar updated');

				if (step && step === this.timelineStep) {
					this.submitTimeline(collectionId, timeline);
				} else {
					if (this.exitAfterSave) {
						this.exit();
					} else {
						switch (this.step) {
							case 9:
								this.step = 11;
								break;
							case 11:
								this.step = 14;
								break;
							case 14:
								this.step = 17;
								break;
							default:
								this.step++;
								break;
						}
						this.guideStepUpdate();
						this.router.navigate(['guide', collectionId, 'edit', this.step]);
						this.busySavingData = false;
					}
				}
			}, (err: HttpErrorResponse ) => {
				if (err.statusText === 'Unauthorized') {
					this.dialogsService.openLogin().subscribe(res => {
						if (res) {
							this.executeSubmitGuide(data, timeline, step);
						}
					});
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
		if (body.startDate && body.endDate && itinerary && itinerary.length > 0 && this.totalDuration > 0) {
			this.http.patch(environment.apiUrl + '/api/collections/' + collectionId + '/calendar', body, this.requestHeaderService.options)
				.subscribe((response: any) => {
					if (this.exitAfterSave) {
						this.exit();
					} else {
						this.step++;
						this.guideStepUpdate();
						this.router.navigate(['guide', collectionId, 'edit', this.step]);
						this.busySavingData = false;
					}
				});
		} else {
			this.busySavingData = false;
			console.log('No date selected or no content added to itinerary! - ' + JSON.stringify(itinerary));
			if (!itinerary || itinerary.length === 0 || this.totalDuration === 0) {
				if (this.exitAfterSave) {
					this.snackBar.open('You need to add at least 1 activity to your guide to proceed.', 'Exit Anyways', {
						duration: 5000
					}).onAction().subscribe(res => {
						this.exit();
					});
				} else {
					this.snackBar.open('You need to add at least 1 activity to your guide to proceed.', 'Close', {
						duration: 5000
					});
				}
			} else {
				this.snackBar.open('No dates have been selected for your guide.', 'Close', {
					duration: 5000
				});
			}
		}
	}

	public submitInterests() {
		this.busySavingData = true;
		let body = {};
		const topicArray = [];
		this.interests.forEach((topic) => {
			topicArray.push(topic.id);
		});
		console.log(topicArray);
		body = {
			'targetIds': topicArray
		};

		if (topicArray.length !== 0) {
			if (this.originalInterests.length > 0) {
				const unlinkObeservables: Array<Observable<ArrayBuffer>> = [];
				this.originalInterests.forEach(interest => {
					console.log(interest);
					unlinkObeservables.push(this._collectionService.unlinkTopic(this.guideId, interest.id));
				});
				console.log(unlinkObeservables);
				const finalObservable = merge(...unlinkObeservables);
				finalObservable.pipe(
					flatMap(res => {
						return this.http.patch(environment.apiUrl + '/api/collections/' + this.guideId + '/topics/rel', body, this.requestHeaderService.options);
					})
				).subscribe((res: any) => {
					this._collectionService.getCollectionDetail(this.guideId, this.query)
						.subscribe((resData) => {
							this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(resData, this.sidebarMenuItems);
						});
					this.busySavingData = false;
					if (this.exitAfterSave) {
						this.exit();
					} else {
						this.step++;
						this.guideStepUpdate();
						this.router.navigate(['guide', this.guideId, 'edit', this.step]);
					}
				});
			} else {
				this.http.patch(environment.apiUrl + '/api/collections/' + this.guideId + '/topics/rel', body, this.requestHeaderService.options)
					.subscribe((res: any) => {
						this._collectionService.getCollectionDetail(this.guideId, this.query)
							.subscribe((resData) => {
								this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(resData, this.sidebarMenuItems);
							});
						this.busySavingData = false;
						if (this.exitAfterSave) {
							this.exit();
						} else {
							this.step++;
							this.guideStepUpdate();
							this.router.navigate(['guide', this.guideId, 'edit', this.step]);
						}
					});
			}


		} else {
			if (this.exitAfterSave) {
				this.exit();
			} else {
				this.step++;
				this.guideStepUpdate();
				this.router.navigate(['guide', this.guideId, 'edit', this.step]);
				this.busySavingData = false;
			}
		}
	}

	/**
	 * goto(toggleStep)  */
	public goto(toggleStep) {
		this.step = toggleStep;
		this.router.navigate(['guide', this.guideId, 'edit', +toggleStep]);
		this.showBackground = this.step && this.step.toString() === '6';
	}



	submitForReview() {
		// Post Guide for review
		this._collectionService.submitForReview(this.guideId)
			.subscribe((res: any) => {
				this.guide.controls.status.setValue('submitted');
				console.log('Guide submitted for review');
				this.isSubmitted = true;
				this.dialogsService.openCollectionSubmitDialog({ type: 'guide' });
				// call to get status of guide
				if (this.guide.controls.status.value === 'active') {
					this.sidebarMenuItems[3].visible = false;
					this.sidebarMenuItems[4].visible = true;
					this.sidebarMenuItems[4].active = true;
					this.sidebarMenuItems[4].submenu[0].visible = true;
					this.sidebarMenuItems[4].submenu[1].visible = true;

				}
			});

	}

	saveandexit() {
		this.exitAfterSave = true;
		switch (this.step) {
			case 3:
				this.submitInterests();
				break;
			case 12:
				this.certificateComponent.submitCertificate();
				break;
			case 13:
				this.submitAssessment();
				break;
			case 16:
				this.submitGuideTimeline();
				break;
			case 18:
				this.exit();
				break;
			default:
				this.submitGuide();
				break;
		}
	}

	exit() {
		this.router.navigate(['console/teaching/guides']);
	}

	addNewTopic() {
		let tempArray = [];
		tempArray = _.union(this.interests, tempArray);
		let topic;
		this.dialogsService
			.addNewTopic()
			.subscribe((res: any) => {
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
			.subscribe((res: any) => {
				if (res) {
					this.languagesArray.push(res);
					this.guide.controls.selectedLanguage.patchValue(res.name);
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
			.subscribe((response: any) => {
				console.log(response);
				if (fileType === 'video') {
					this.urlForVideo = _.remove(this.urlForVideo, function (n) {
						return n !== fileurl;
					});
					this.guide.controls.videoUrls.patchValue(this.urlForVideo);
				} else if (fileType === 'image') {
					this.urlForImages = _.remove(this.urlForImages, function (n) {
						return n !== fileurl;
					});
					this.guide.controls.imageUrls.patchValue(this.urlForImages);
				}
				this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(this.guide.value, this.sidebarMenuItems);
			});

	}

	deleteFromContainerArr(event, fileType) {
		for (let i = 0; i < event.target.files.length; i++) {
			let file = event.target.files[i];
			const fileurl = file;
			file = _.replace(file, 'download', 'files');
			this.http.delete(environment.apiUrl + file, this.requestHeaderService.options)
				.subscribe((response: any) => {
					console.log(response);
					if (fileType === 'video') {
						this.urlForVideo = _.remove(this.urlForVideo, function (n) {
							return n !== fileurl;
						});
						this.guide.controls.videoUrls.patchValue(this.urlForVideo);
					} else if (fileType === 'image') {
						this.urlForImages = _.remove(this.urlForImages, function (n) {
							return n !== fileurl;
						});
						this.guide.controls.imageUrls.patchValue(this.urlForImages);
					}
				});

		}
	}

	toggleChoice(choice) {
		this.selectedOption = choice;
	}


	submitPhoneNo(element, text) {
		// Call the OTP service
		// Post Guide for review

		element.textContent = text;
		this._collectionService.sendVerifySMS(this.phoneDetails.controls.phoneNo.value, this.phoneDetails.controls.countryCode.value)
			.subscribe((res: any) => {
				this.otpSent = true;
				this.phoneDetails.controls.phoneNo.disable();
				this.phoneDetails.controls.countryCode.disable();
				element.textContent = 'Verification code sent';
			});
	}

	submitOTP() {
		this._collectionService.confirmSmsOTP(this.phoneDetails.controls.inputOTP.value)
			.subscribe((res: any) => {
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

	/**
	 * Make the dates section of this page editable
	 */
	makeDatesEditable() {
		this.datesEditable = true;
	}

	sort(calendars, param1, param2) {
		return _.sortBy(calendars, [param1, param2]);
	}

	private retrieveAccounts() {
		this.payoutAccounts = [];
		this._paymentService.retrieveConnectedAccount().subscribe((result: any) => {
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
			this._paymentService.postPayoutRule(this.guideId, newPayoutId).subscribe((res: any) => {
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
			this.guide.controls['price'].setValue(0);
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
			gyan: ['', [Validators.required, Validators.max(100), Validators.min(1)]]
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
		this.busySavingData = true;
		this._collectionService.updateAssessmentModel(this.guideId, {
			type: this.assessmentForm.controls['type'].value,
			style: this.assessmentForm.controls['style'].value
		}).pipe(
			flatMap(res => {
				console.log(res);
				assessmentModelObject = <any>res;
				this.guideData.assessment_models = [assessmentModelObject];
				return this._collectionService.updateAssessmentRules(assessmentModelObject.id, this.assessmentForm.controls['rules'].value);
			}),
			flatMap(res => {
				this.guideData.assessment_models[0].assessment_rules = res;
				return this._collectionService.updateNAAssessmentRules(assessmentModelObject.id, this.assessmentForm.controls['nARules'].value);
			})
		).subscribe(res => {
			this.guideData.assessment_models[0].assessment_na_rules = res;
			this._leftSideBarService.updateSideMenu(this.guideData, this.sidebarMenuItems);

			if (this.exitAfterSave) {
				this.exit();
			} else {
				this.step++;
				this.guideStepUpdate();
				this.router.navigate(['guide', this.guideId, 'edit', this.step]);
				this.busySavingData = false;
			}
		}, err => {
			console.log(err);
			this.busySavingData = false;
			this.snackBar.open('An error occurred', 'close', {
				duration: 5000
			});
		});
	}

	private changeControl(indexOfOtherControl: number): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } | null => {
			if (indexOfOtherControl === 1 && this.assessmentForm && this.assessmentForm.controls['nARules'] && this.assessmentForm.controls['nARules']['controls'][indexOfOtherControl]) {
				const formArray = <FormArray>this.assessmentForm.controls['nARules'];
				const otherNArule = <FormGroup>formArray.controls[indexOfOtherControl];
				otherNArule.controls['gyan'].patchValue(100 - Number(control.value));
				return null;
			} else {
				return null;
			}
		};
	}

	public termsAndCondition() {
		this.dialogsService.termsAndConditionsDialog().subscribe();
	}

	public standards() {
		this.dialogsService.collectionStandardsDialog().subscribe();
	}

	public importProfileBio() {
		this.guide.controls.aboutHost.patchValue(this.guideData.owners[0].profiles[0].description);
	}

	public assessmentChange(event: any) {
		const value = <AssessmentTypeData['values']>event.value;
		console.log(value);
		this.assessmentForm.controls['rules'] = this._fb.array([], Validators.minLength(1));
		const rulesArray = <FormArray>this.assessmentForm.controls['rules'];
		if (value.style === 'custom') {
			this.assessmentForm.controls['style'].patchValue('');
			rulesArray.push(
				this._fb.group({
					value: ['', Validators.required],
					gyan: ['', [Validators.required, Validators.max(100), Validators.min(1)]]
				})
			);
		} else {
			this.assessmentForm.controls['style'].patchValue(value.style);
			value.rules.forEach(val => {
				rulesArray.push(
					this._fb.group({
						value: [val.value, Validators.required],
						gyan: [val.gyan, [Validators.required, Validators.max(100), Validators.min(1)]]
					})
				);
			});
		}
	}

	public insertImage() {
		this.dialogsService.addImageDialog().subscribe(res => {
			if (res) {
				this.guide.controls['description'].patchValue(this.guide.value.description + ' ![](' + res + ') ');
			}
		}, err => {
			console.log(err);
		});
	}
}

interface AssessmentTypeData {
	system: string;
	values: {
		style: string;
		rules?: Array<{
			value: string,
			gyan: number
		}>;
	};
	description: string;
}

interface SubTypeInterface {
	name: string;
	pic_url: string;
	description: string;
}
