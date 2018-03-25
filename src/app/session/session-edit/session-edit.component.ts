import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';
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
import { ProfileService } from '../../_services/profile/profile.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-session-edit',
  templateUrl: './session-edit.component.html',
  styleUrls: ['./session-edit.component.scss']
})
export class SessionEditComponent implements OnInit {
  public busySave = false;
  public busyPreview = false;
  public busyInterest = false;
  public busyLanguage = false;
  public busyBasics = false;
  public busyHost = false;
  public envVariable;
  public busySessionPage = false;
  public busyPayment = false;
  public sidebarFilePath = 'assets/menu/session-static-left-sidebar-menu.json';
  public sidebarMenuItems;
  public itenariesForMenu = [];

  public profile: any;

  public interest1: FormGroup;
  public newTopic: FormGroup;
  public session: FormGroup;
  public selectedTopic: FormGroup;
  public timeline: FormGroup;
  public conditions: FormGroup;
  public phoneDetails: FormGroup;
  public workForm: FormGroup;

  public profileForm: FormGroup;

  public supplementUrls = new FormArray([]);
  public uploadingImage = false;
  public uploadingVideo = false;

  private sessionId: string;
  public sessionData: any;
  public isWorkShopActive = false;
  public activeSession = '';
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

  private options;

  profileImagePending: Boolean;
  sessionVideoPending: Boolean;
  sessionImage1Pending: Boolean;
  sessionImage2Pending: Boolean;

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

  public urlForVideo = [];
  public urlForImages = [];

  public datesEditable = false;
  public isPhoneVerified = false;
  public isSubmitted = false;
  public connectPaymentUrl = '';
  public freeSession = false;
  filteredLanguageOptions: Observable<string[]>;
  public payoutLoading = true;
  public payoutAccounts: Array<any>;
  public events: any[];
  public query = {
    'include': [
      'topics',
      'calendars',
      { 'participants': [{ 'profiles': ['work'] }] },
      { 'owners': [{ 'profiles': ['phone_numbers'] }] },
      { 'contents': ['schedules'] },
      'payoutrules',
      'provisions',
      'packages',
      'preferences',
      'availability'
    ]
  };

  // Geo Location
  public userSettings: any;

  public paymentInfo: FormGroup;
  private payoutRuleNodeId: string;
  private payoutRuleAccountId: string;
  // TypeScript public modifiers
  public currentDate: Date;
  public picture_url: string;
  public profile_picture_array = [];
  public profile_video: string;
  public loadingMediaPage = true;
  private languagesAsync: BehaviorSubject<any[]>;
  public languages: any[];
  public language: Observable<any[]>;
  public filteredOptions: Observable<any[]>;
  public disableEndDate = false;
  public years: any[];
  public disableEndYearBool = false;
  public provisionForm: FormGroup;
  public packageForm: FormGroup;
  public paidPackages: FormArray;
  public availableDurations: Array<any>;
  public preferencesForm: FormGroup;
  public calendarEvent = 'add';
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
    public _profileService: ProfileService,
  ) {
      this.envVariable = environment;
    this.activatedRoute.params.subscribe(params => {
      this.sessionId = params['collectionId'];
      this.step = params['step'];
      this.connectPaymentUrl = 'https://connect.stripe.com/express/oauth/authorize?response_type=code&client_id=ca_AlhauL6d5gJ66yM3RaXBHIwt0R8qeb9q&scope=read_write&redirect_uri=' + environment.clientUrl + '/console/account/payoutmethods&state=' + environment.clientUrl + '/session/' + this.sessionId + '/edit/' + this.step;
      this.searchTopicURL = environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics/suggest?field=name&query=';
      this.createTopicURL = environment.apiUrl + '/api/' + environment.uniqueDeveloperCode + '_topics';
    });
    this.userId = _cookieUtilsService.getValue('userId');
    this.options = requestHeaderService.getOptions();
    this.currentDate = moment().toDate();
  }

  public ngOnInit() {
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
    this.session = this._fb.group({
      // id: '',
      type: 'session',
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
      status: 'draft'
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
      phoneNo: '',
      inputOTP: '',
      countryCode: ''
    });


    this.profileForm = this._fb.group(
      {
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
        description: ''
      }
    );

    this.workForm = this._fb.group({
      education: this._fb.array([
        this.initializeEducationForm()
      ]),
      work: this._fb.array([
        this.initializeWorkForm()
      ])
    });


    this.provisionForm = this._fb.group({
      provisions: this._fb.array([])
    });

    this.packageForm = this._fb.group(
      {
        trialPackage: this._fb.group({
          type: 'trial',
          price: 0,
          currency: 'USD',
          duration: 30,
          sessionCount: 1,
          cancellationPolicy: '3 Days',
          isFree: false
        }),
        paidPackages: this._fb.array([
        ])
      }
    );

    this.preferencesForm = this._fb.group({
      bookingProcess: 'auto',
      customUrl: ''
    });

    this.initializeFormFields();
    this.initializeProfile();
    this.initializeSession();
    this.getLanguages();
    this.getTeachingTopics();
    this.languagesAsync = <BehaviorSubject<any[]>>new BehaviorSubject([]);
    this.language = this.languagesAsync.asObservable();
    this._CANVAS = <HTMLCanvasElement>document.querySelector('#video-canvas');
    this._VIDEO = document.querySelector('#main-video');
    this.years = this.getYearsArray();
    this.events = [];
  }

  private getTeachingTopics() {
    const queryTeaching = {
      'relInclude': 'experience'
    };
    this._profileService.getTeachingTopics(this.userId, queryTeaching).subscribe((response) => {
      console.log(response);
      // Topics
      this.relTopics = _.uniqBy(response, 'id');
      this.interests = this.relTopics;
      if (this.interests) {
        this.suggestedTopics = this.interests;
      }
    });
  }

  private initializeProfile() {
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
      this.profile = profiles[0];
      this.picture_url = profiles[0].picture_url;
      this.profile_video = profiles[0].profile_video;
      this.loadingMediaPage = false;
      this.userSettings = {
        geoLocation: [37.76999, -122.44696],
        geoRadius: 5,
        inputPlaceholderText: 'Where do you live',
        showSearchButton: false,
        inputString: profiles[0].location_string
      };
      this.setFormValues(profiles);
    });
  }

  private setFormValues(profiles: Array<any>) {
    if (profiles.length > 0) {
      this.profileForm.patchValue(profiles[0]);
      if (profiles[0].other_languages && profiles[0].other_languages.length > 0) {
        this.profileForm.setControl('other_languages', this._fb.array(
          profiles[0].other_languages
        ));
      }

      if (profiles[0].work && profiles[0].work.length > 0) {
        this.workForm.setControl('work', this._fb.array([]));
        const workArray = <FormArray>this.workForm.controls['work'];
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
        this.workForm.setControl('education', this._fb.array([]));
        const educationArray = <FormArray>this.workForm.controls['education'];
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
          this.snackBar.open('Payout account updated', 'close', {
            duration: 500
          });
        }
      }, err => {
        this.payoutLoading = false;
        this.snackBar.open('Unable to update account', 'close', {
          duration: 500
        });
      });
    } else {
      this._paymentService.postPayoutRule(this.sessionId, newPayoutId).subscribe((res: any) => {
        if (res) {
          this.payoutLoading = false;
          this.snackBar.open('Payout account added', 'close', {
            duration: 500
          });
          this.payoutRuleNodeId = res.id;
          this.payoutRuleAccountId = newPayoutId;
        }
      }, err => {
        this.payoutLoading = false;
        this.snackBar.open('Unable to add account', 'close', {
          duration: 500
        });
      });

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

  private initializeFormFields() {
    this.difficulties = ['Beginner', 'Intermediate', 'Advanced'];

    this.cancellationPolicies = ['24 Hours', '3 Days', '1 Week'];

    this.currencies = ['USD', 'INR', 'GBP'];


    this.learnerType_array = {
      learner_type: [
        { id: 'auditory', display: 'Auditory' }
        , { id: 'visual', display: 'Visual' }
        , { id: 'read-write', display: 'Read & Write' }
        , { id: 'kinesthetic', display: 'Kinesthetic' }
      ]
    };

    this.availableDurations = [
      { value: 30, text: '30 minutes' },
      { value: 60, text: '1 hour' },
      { value: 120, text: '2 hour' },
      { value: 180, text: '3 hour' },
      { value: 240, text: '4 hour' }
    ];

    this.placeholderStringTopic = 'Search for a topic or enter a new one';

    this.key = 'access_token';

    this.countryPickerService.getCountries()
      .subscribe((countries) => this.countries = countries);

    this.languagePickerService.getLanguages()
      .subscribe((languages) => {
        this.languagesArray = _.map(languages, 'name');
        this.filteredLanguageOptions = this.session.controls.selectedLanguage.valueChanges
          .startWith(null)
          .map(val => val ? this.filter(val) : this.languagesArray.slice());
      });

    if (this.interests.length === 0) {
      this.http.get(environment.searchUrl + '/api/search/topics')
        .map((response: any) => {
          this.suggestedTopics = response.slice(0, 7);
        }).subscribe();
    } else {
      this.suggestedTopics = this.interests;
    }

    this.profileImagePending = true;
    this.sessionVideoPending = true;
    this.sessionImage1Pending = true;
  }

  filter(val: string): string[] {
    return this.languagesArray.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  private initializeSession() {
    if (this.sessionId) {
      this._collectionService.getCollectionDetail(this.sessionId, this.query)
        .subscribe((res) => {
          this.sessionData = res;
          if (this.sessionData.payoutrules && this.sessionData.payoutrules.length > 0) {
            this.payoutRuleNodeId = this.sessionData.payoutrules[0].id;
            this.payoutRuleAccountId = this.sessionData.payoutrules[0].payoutId1;
          }
          this.retrieveAccounts();
          this.initializeFormValues(res);
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
      // this.session.controls.selectedLanguage.setValue(event.value);
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
        this.paymentInfo.controls['id'].patchValue(this.sessionData.payoutrules[0].payoutId1);
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
    const options = {};
    this.removedInterests = event;
    if (this.removedInterests.length !== 0) {
      this.removedInterests.forEach((topic) => {
        this.http.delete(environment.apiUrl + '/api/collections/' + this.sessionId + '/topics/rel/' + topic.id, options)
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
    // Language
    if (res.language && res.language.length > 0) {
      this.selectedLanguages = res.language[0];
      this.session.controls.selectedLanguage.patchValue(res.language[0]);
    }
    // aboutHost TBD
    this.session.controls.aboutHost.patchValue(res.aboutHost);

    // Title
    this.session.controls.title.patchValue(res.title);

    // Headline
    this.session.controls.headline.patchValue(res.headline);

    // Description
    this.session.controls.description.patchValue(res.description);

    // Difficulty Level
    this.session.controls.difficultyLevel.patchValue(res.difficultyLevel);

    // Notes
    this.session.controls.notes.patchValue(res.notes);

    // Seats
    this.session.controls.maxSpots.patchValue(res.maxSpots);

    // Photos and Videos
    if (res.videoUrls && res.videoUrls.length > 0) {
      this.session.controls['videoUrls'].patchValue(res.videoUrls);
      this.urlForVideo = res.videoUrls;
    }
    if (res.imageUrls && res.imageUrls.length > 0) {
      this.session.controls['imageUrls'].patchValue(res.imageUrls);
      this.urlForImages = res.imageUrls;
    }

    // Currency, Amount, Cancellation Policy
    this.session.controls.price.patchValue(res.price);
    if (res.currency) {
      this.session.controls.currency.patchValue(res.currency);
    }
    if (res.cancellationPolicy) {
      this.session.controls.cancellationPolicy.setValue(res.cancellationPolicy);
    }

    // Status
    this.session.controls.status.setValue(res.status);

    this.isPhoneVerified = res.owners[0].phoneVerified;

    this.isSubmitted = this.session.controls.status.value === 'submitted';

    if (res.owners[0].profiles[0].phone_numbers && res.owners[0].profiles[0].phone_numbers.length) {
      this.phoneDetails.controls.phoneNo.patchValue(res.owners[0].profiles[0].phone_numbers[0].subscriber_number);
    }
    if (!this.timeline.controls.calendar.value.startDate || !this.timeline.controls.calendar.value.endDate) {
      this.makeDatesEditable();
    }
    const provisions = <FormArray>this.provisionForm.controls['provisions'];
    res.provisions.forEach(provision => {
      provisions.push(this.initializeProvisionForm(provision.text));
    });

    res.packages.forEach(packageObj => {
      const sanitizedPackageObj = this._collectionService.sanitize(packageObj);
      if (sanitizedPackageObj.type === 'trial') {
        this.packageForm.controls['trialPackage'].patchValue(sanitizedPackageObj);
        if (sanitizedPackageObj.price === 0) {
          const trialPckg = <FormGroup>this.packageForm.controls['trialPackage'];
          trialPckg.controls['isFree'].patchValue(true);
        }
      } else {
        const paidPackages = <FormArray>this.packageForm.controls['paidPackages'];
        paidPackages.push(this.initializePaidPackageForm(sanitizedPackageObj));
      }
    });

    if (res.preferences.length > 0) {
      this.preferencesForm.patchValue(this._collectionService.sanitize(res.preferences[0]));
    }

    if (res.availability.length > 0) {
      res.availability.forEach(element => {
        this.events.push(
          {
            'id': this.events.length,
            'start': moment.utc(element.startDateTime).local().format('YYYY-MM-DDTHH:mm:ss.sssZ'),
            'end': moment.utc(element.startDateTime).local().add(30, 'minutes').format('YYYY-MM-DDTHH:mm:ss.sssZ')
          }
        );
      });
    }

    console.log(res);

  }

  initAddress() {
    // initialize our address
    return this._fb.group({
      street: ['', Validators.required],
      postcode: ['']
    });
  }

  public sessionStepUpdate() {
    if (this.session.value.stage < this.step) {
      this.session.patchValue({
        'stage': this.step
      });
    }

  }

  public nextStep() {
    this.step++;
    this.sessionStepUpdate();
    this.router.navigate(['session', this.sessionId, 'edit', this.step]);
  }

  public addImageUrl(value: String) {
    this.urlForImages.push(value);
    const control = <FormArray>this.session.controls['imageUrls'];
    this.sessionImage1Pending = false;
    control.patchValue(this.urlForImages);
    const tempSessionData = this.sessionData;
    tempSessionData.imageUrls = this.session.controls['imageUrls'].value;
    this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(tempSessionData, this.sidebarMenuItems);

  }

  public addVideoUrl(value: String) {
    this.urlForVideo.push(value);
    const control = this.session.controls['videoUrls'];
    this.sessionVideoPending = false;
    control.patchValue(this.urlForVideo);
    const tempSessionData = this.sessionData;
    tempSessionData.videoUrls = this.session.controls['videoUrls'].value;
    this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(tempSessionData, this.sidebarMenuItems);
  }



  public changeInterests(topic: any) {
    const index = this.interests.indexOf(topic);
    if (index > -1) {
      this.interests.splice(index, 1); // If the user currently uses this topic, remove it.
    } else {
      this.interests.push(topic); // Otherwise add this topic.
    }
  }

  public submitSession(data, timeline?, step?) {
    // if (this.calendarIsValid()) {
    //   if (this.session.controls.status.value === 'active') {
    //     this.dialogsService.openCollectionCloneDialog({
    //       type: 'session'
    //     }).subscribe((result) => {
    //       if (result === 'accept') {
    //         this.executeSubmitSession(data, timeline, step);
    //       }
    //       else if (result === 'reject') {
    //         this.router.navigate(['/console/teaching/sessions']);
    //       }
    //     });
    //   }
    //   else {
    //     this.executeSubmitSession(data, timeline, step);
    //   }
    // }

  }

  private calendarIsValid() {
    const calendarGroup = <FormGroup>this.timeline.controls['calendar'];
    const startMoment = moment(calendarGroup.controls['startDate'].value).local();
    const endMoment = moment(calendarGroup.controls['endDate'].value).local();
    if (startMoment.diff(endMoment) > 0) {
      this.snackBar.open('Start date cannot be after end date!', 'Close', {
        duration: 800
      });
      return false;
    }
    if (startMoment.diff(moment()) < 0) {
      this.snackBar.open('Start date cannot be in the past!', 'Close', {
        duration: 800
      });
      return false;
    }
    return true;
  }

  private executeSubmitSession(data, timeline?, step?) {
    const lang = <FormArray>this.session.controls.language;
    lang.removeAt(0);
    lang.push(this._fb.control(data.value.selectedLanguage));
    const body = data.value;
    delete body.selectedLanguage;

    this._collectionService.patchCollection(this.sessionId, body).map(
      (response: any) => {
        const result = response;
        let collectionId;
        if (result.isNewInstance) {
          this.session.controls.status.setValue(result.status);
          collectionId = result.id;
        } else {
          collectionId = this.sessionId;
        }
        result.topics = this.sessionData.topics;
        result.contents = this.sessionData.contents;
        result.owners = this.sessionData.owners;
        this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(result, this.sidebarMenuItems);

        if (step && step > 12) {
          this.submitTimeline(collectionId, timeline);
        }
        if (!result.isNewInstance) {
          this.step++;
          this.sessionStepUpdate();
        }
        this.router.navigate(['session', collectionId, 'edit', this.step]);

      }).subscribe();
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
      this.http.patch(environment.apiUrl + '/api/collections/' + collectionId + '/calendar', body)
        .subscribe((response) => {
          this.step++;
          this.sessionStepUpdate();
          this.router.navigate(['session', collectionId, 'edit', this.step]);
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
    console.log(topicArray);
    this.relTopics.forEach((topic) => {
      topicArray = _.without(topicArray, topic.id);
    });
    body = {
      'targetIds': topicArray
    };
    if (topicArray.length !== 0) {
      this.http.patch(environment.apiUrl + '/api/peers/' + this.userId + '/topicsTeaching/rel', body)
        .map(response => response).publishReplay().refCount().subscribe((res) => {
          // this._collectionService.getCollectionDetail(this.sessionId, this.query)
          //   .subscribe((resData) => {
          //     this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(resData, this.sidebarMenuItems);
          //   });
          this.nextStep();
          this.busyInterest = false;
        });
    } else {
      this.nextStep();
    }
  }

  /**
   * goto(toggleStep)  */
  public goto(toggleStep) {
    this.busyBasics = false;
    this.busySessionPage = false;
    this.step = toggleStep;
    this.router.navigate(['session', this.sessionId, 'edit', +toggleStep]);
    if (toggleStep === 2) {
      this.busyBasics = true;
      this.busyBasics = false;
    }
    if (toggleStep === 6) {
      this.busySessionPage = true;
    }
  }



  submitForReview() {
    // Post Session for review
    this._collectionService.submitForReview(this.sessionId)
      .subscribe((res) => {
        this.session.controls.status.setValue('submitted');
        this.isSubmitted = true;
        this.dialogsService.openCollectionSubmitDialog({
          type: 'session'
        });

        // call to get status of session
        if (this.session.controls.status.value === 'active') {
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
    this.sessionStepUpdate();
    if (this.step === 13) {
      const data = this.timeline;
      const body = data.value.calendar;
      if (body.startDate && body.endDate) {
        this.http.patch(environment.apiUrl + '/api/collections/' + this.sessionId + '/calendar', body, this.options)
          .map((response) => {
            this.busySave = false;
            this.router.navigate(['console/teaching/sessions']);
          })
          .subscribe();
      } else {
        console.log('Enter Date!');
      }

    } else {
      const data = this.session;
      const lang = <FormArray>this.session.controls.language;
      lang.removeAt(0);
      lang.push(this._fb.control(data.value.selectedLanguage));
      const body = data.value;
      delete body.selectedLanguage;
      this._collectionService.patchCollection(this.sessionId, body).map(
        (response) => {
          this.router.navigate(['console/teaching/sessions']);
        }).subscribe();
    }
  }

  exit() {
    this.router.navigate(['console/teaching/sessions']);
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
          this.session.controls.selectedLanguage.patchValue(res.name);
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

  toggleChoice(choice) {
    this.selectedOption = choice;
  }


  submitPhoneNo(element, text) {
    // Call the OTP service
    // Post Session for review

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
        this.snackBar.open('Token Verified', 'close', {
          duration: 500
        });
        this.step++;
      },
        (error) => {
          this.snackBar.open(error.message, 'close', {
            duration: 500
          });
        });
  }

  takeToPayment() {
    this.busyPayment = true;
    this.step++;
    this.router.navigate(['session', this.sessionId, 'edit', this.step]);
  }

  /**
   * Make the dates section of this page editable
   */
  makeDatesEditable() {
    this.datesEditable = true;
  }

  openSession() {
    this.busyPreview = true;
    this.router.navigate(['/session', this.sessionId]);
    this.busyPreview = false;
  }

  sort(calendars, param1, param2) {
    return _.sortBy(calendars, [param1, param2]);
  }

  onFreeChange(event, packageObj) {
    if (event) {
      packageObj.controls['price'].setValue(0);
    }
  }

  /**
   * saveProfile
   */
  public saveProfile() {
    this._profileService.updateProfile(this.userId, this.profileForm.value)
      .subscribe((response) => {
        this.nextStep();
      }, (err) => {
        console.log('Error updating Peer: ');
        console.log(err);
        this.snackBar.open('Profile Update Failed', 'Retry').onAction().subscribe((response) => {
          this.saveProfile();
        });
      });
  }

  public saveWorkEducation() {
    this._profileService.updateWork(this.userId, this.profile.id, this.workForm.controls['work'].value)
      .flatMap((response) => {
        return this._profileService.updateEducation(this.userId, this.profile.id, this.workForm.controls['education'].value);
      }).subscribe((response) => {
        this.nextStep();
      }, (err) => {
        console.log('Error updating Peer: ');
        console.log(err);
        this.snackBar.open('Profile Update Failed', 'Retry').onAction().subscribe((response) => {
          this.saveProfile();
        });
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

  private initializeWorkForm(): FormGroup {
    return this._fb.group({
      position: ['', Validators.requiredTrue],
      company: ['', Validators.requiredTrue],
      startDate: [null, Validators.requiredTrue],
      endDate: [null, Validators.requiredTrue],
      presentlyWorking: false
    });
  }

  uploadVideo(event) {
    this.uploadingVideo = true;
    for (const file of event.files) {
      this.mediaUploader.upload(file).subscribe((response) => {
        this.profile_video = response.url;
        this._profileService.updateProfile(this.userId, {
          'profile_video': response.url
        }).subscribe(res => {
          this.profile_video = res.profile_video;
          this.uploadingVideo = false;
        }, err => {
          console.log(err);
        });
      }, err => {
        console.log(err);
      });
    }
  }

  uploadImage(event) {
    this.uploadingImage = true;
    for (const file of event.files) {
      this.mediaUploader.upload(file).subscribe((response) => {
        this.picture_url = response.url;
        this._profileService.updateProfile(this.userId, {
          'picture_url': response.url
        }).subscribe(res => {
          this.picture_url = res.picture_url;
          this.uploadingImage = false;
        }, err => {
          console.log(err);
        });
        // this.profile_picture_array.push(response.url);
      }, err => {
        console.log(err);
      });
    }
  }

  setProfilePic(image, type) {
    this._profileService.updateProfile(this.userId, {
      'picture_url': image
    }).subscribe(response => {
      this.picture_url = response.url;
    }, err => {
      console.log(err);
    });
  }


  deleteFromContainerArr(event) {
    console.log(event);
  }

  deleteFromContainer(url: string, type: string) {
    if (type === 'image') {
      this._profileService.updateProfile(this.userId, {
        'picture_url': ''
      }).subscribe(response => {
        this.picture_url = response.picture_url;
      });
    } else if (type === 'video') {
      this._profileService.updateProfile(this.userId, {
        'profile_video': ''
      }).subscribe(response => {
        this.profile_video = response.profile_video;
      });
    } else {
      console.log('error');

    }
  }

  autoCompleteCallback(data: any): any {
    this.profileForm.controls['location_string'].patchValue(data.name);
    this.profileForm.controls['location_lat'].patchValue(data.geometry.location.lat);
    this.profileForm.controls['location_lng'].patchValue(data.geometry.location.lng);
  }


  getLanguages() {
    // this.http.get(environment.apiUrl + '/api/languages')
    // .map(response => response ).subscribe(data => {
    this.languagePickerService.getLanguages().subscribe(data => {
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


  addLanguageField() {
    const otherLanguages = <FormArray>this.profileForm.controls['other_languages'];
    otherLanguages.push(
      this._fb.control('')
    );
    console.log(this.profileForm.controls['other_languages']);
  }

  removeControl(i: number) {
    const otherLanguages = <FormArray>this.profileForm.controls['other_languages'];
    otherLanguages.removeAt(i);
  }

  public deleteWork(index: number) {
    const work = <FormArray>this.workForm.controls['work'];
    if (index > 0) {
      work.removeAt(index);
      return;
    }
  }

  toggleEndDate() {
    this.disableEndDate = !this.disableEndDate;
  }

  public addWork() {
    const work = <FormArray>this.workForm.controls['work'];
    work.push(
      this.initializeWorkForm()
    );
  }

  public getYearsArray() {
    const years = [];
    for (let i = moment().year(); i >= 1917; i--) {
      years.push(i);
    }
    return years;
  }

  disableEndYear() {
    this.disableEndYearBool = !this.disableEndYearBool;
  }

  /**
  * deleteeducation(index)  */
  public deleteEducation(index: number) {
    const education = <FormArray>this.workForm.controls['education'];
    if (index > 0) {
      education.removeAt(index);
      return;
    }
  }

  public addEducation() {
    const education = <FormArray>this.workForm.controls['education'];
    education.push(
      this.initializeEducationForm()
    );
  }

  public updateChanges(type, topic) {
    if (topic['experience']) {
      this._profileService.updateTeachingTopic(this.userId, topic.id, { 'experience': topic['experience'] })
        .subscribe(response => {
          this.snackBar.open('Topic Updated', 'Close', {
            duration: 800
          });
        }, err => {
          console.log(err);
          this.snackBar.open('Topic Update Failed', 'Retry').onAction().subscribe(() => {
            this.updateChanges(type, topic);
          });
        });
    }
  }

  public unfollowTopic(type, topic: any) {
    this._profileService.unfollowTopic(this.userId, type, topic.id).subscribe((response) => {
      this.getTeachingTopics();
    }, (err) => {
      console.log(err);
    });
  }

  /**
   * saveProvision
   */
  public saveProvision() {
    this._collectionService.updateProvisions(this.sessionId, this.provisionForm.controls['provisions'].value)
      .subscribe((response) => {
        this.nextStep();
      }, (err) => {
        console.log('Error updating Provision');
        console.log(err);
        this.snackBar.open('Provision Update Failed', 'Retry').onAction().subscribe((response) => {
          this.saveProvision();
        });
      });
  }

  addProvisionField() {
    const provisions = <FormArray>this.provisionForm.controls['provisions'];
    provisions.push(
      this.initializeProvisionForm()
    );
  }

  private initializeProvisionForm(value?: string) {
    return this._fb.group({
      text: value !== undefined ? value : ''
    });
  }

  public handleDayClick(e) {
    if (this.calendarEvent === 'add') {
      const startDate = e.date;
      this.events.push({
        'id': this.events.length,
        'start': e.date.toISOString(),
        'end': e.date.add(30, 'minutes').toISOString()
      });
    }
  }

  public handleEventClick(eventHandle) {
    if (this.calendarEvent === 'delete') {
      this.events.forEach((eventObj, index) => {
        if (eventObj.id === eventHandle.calEvent.id) {
          this.events.splice(index, 1);
          console.log(this.events.length);
        }
      });
    } else {
      console.log(eventHandle);
    }
  }

  public submitAvailability() {
    const availability = [];
    this.events.forEach(event => {
      const numberOfslots = (moment(event.end).diff(moment(event.start), 'minutes') / 30);
      for (let i = 0; i < numberOfslots; i++) {
        availability.push({
          'startDateTime': moment(event.start).add(i * 30, 'minutes').utc().toISOString()
        });
      }
    });
    console.log(availability);
    this._collectionService.updateAvailability(this.sessionId, availability).subscribe(res => {
      this.nextStep();
    });
  }

  public initializePaidPackageForm(packageObj?: any) {
    return this._fb.group({
      type: 'paid',
      price: packageObj !== undefined ? packageObj.price : 0,
      currency: packageObj !== undefined ? packageObj.currency : 'USD',
      duration: packageObj !== undefined ? packageObj.duration : 30,
      sessionCount: packageObj !== undefined ? packageObj.sessionCount : 1,
      cancellationPolicy: packageObj !== undefined ? packageObj.cancellationPolicy : '3 Days',
      isFree: packageObj.price === 0 ? true : false
    });
  }

  public submitPackages() {
    const packagesArray = [];
    if (this.packageForm.value.trialPackage.isFree) {
      this.packageForm.value.trialPackage.price = 0;
    }
    delete this.packageForm.value.trialPackage.isFree;
    packagesArray.push(this.packageForm.value.trialPackage);
    this.packageForm.value.paidPackages.map(packageObj => {
      if (packageObj.isFree) {
        packageObj.price = 0;
      }
      delete packageObj.isFree;
      packagesArray.push(packageObj);
    }
    );
    this._collectionService.postPackages(this.sessionId, packagesArray).subscribe(res => {
      this.nextStep();
    });
  }

  public addPackages() {
    const paidpckg = <FormArray>this.packageForm.controls['paidPackages'];
    paidpckg.push(this.initializePaidPackageForm());
  }

  public deletePackage(index: number) {
    const paidpckg = <FormArray>this.packageForm.controls['paidPackages'];
    paidpckg.removeAt(index);
  }

  public savePreferences() {
    this._collectionService.postPreferences(this.sessionId, this.preferencesForm.value).subscribe(res => {
      this.nextStep();
    });
  }

  public updateEvent(eventHandle) {
    this.events.forEach((eventObj, index) => {
      if (eventObj.id === eventHandle.event.id) {
        // console.log(eventHandle.event);
        if (eventHandle.event.start) {
          this.events[index].start = eventHandle.event.start.toISOString();
          this.events[index].end = eventHandle.event.end.toISOString();
          return;
        }
      }
    });
  }

}

