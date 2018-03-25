import 'rxjs/add/operator/switchMap';
import { Component, OnInit, Input } from '@angular/core';
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
import {environment} from '../../../environments/environment';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { Observable } from 'rxjs/Observable';
import { TopicService } from '../../_services/topic/topic.service';
import { PaymentService } from '../../_services/payment/payment.service';


@Component({
  selector: 'app-community-edit',
  templateUrl: './community-edit.component.html',
  styleUrls: ['./community-edit.component.scss']
})

export class CommunityEditComponent implements OnInit {
  public busySave = false;
  public busyPreview = false;
  public busyInterest = false;
  public busyLanguage = false;
  public busyBasics = false;
  public busyHost = false;
  public busyCommunityPage = false;
  public busyPayment = false;
  public sidebarFilePath = 'assets/menu/community-static-left-sidebar-menu.json';
  public sidebarMenuItems;
  public itenariesForMenu = [];
    public envVariable;
  public interest1: FormGroup;
  public newTopic: FormGroup;
  public community: FormGroup;
  public selectedTopic: FormGroup;
  public timeline: FormGroup;
  public conditions: FormGroup;
  public phoneDetails: FormGroup;
  public paymentInfo: FormGroup;

  public supplementUrls = new FormArray([]);
  public uploadingImage = false;
  public uploadingVideo = false;

  public communityId: string;
  public communityData: any;
  public isWorkShopActive = false;
  public activeCommunity = '';
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
  communityVideoPending: Boolean;
  communityImage1Pending: Boolean;
  communityImage2Pending: Boolean;

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
  private payoutRuleAccountId: string;

  filteredLanguageOptions: Observable<string[]>;

  public query = {
    'include': [
      'topics',
      'calendars',
      { 'participants': [{ 'profiles': ['work'] }] },
      { 'owners': [{ 'profiles': ['phone_numbers'] }] },
      { 'contents': ['schedules', 'locations'] },
      'payoutrules'
    ]
  };

  private payoutRuleNodeId: string;
  public payoutLoading = true;
  public payoutAccounts: Array<any>;
  public freeCommunity = false;
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
    private location: Location
  ) {
      this.envVariable = environment;
    this.activatedRoute.params.subscribe(params => {
      this.communityId = params['collectionId'];
      this.step = params['step'];
      // this.connectPaymentUrl = 'https://connect.stripe.com/express/oauth/authorize?response_type=code&' +
      //   'client_id=ca_AlhauL6d5gJ66yM3RaXBHIwt0R8qeb9q&scope=read_write&redirect_uri=' + environment.apiUrl
      //   + '/community/' + this.communityId + '/edit/' + this.step + '&state=1';
      this.connectPaymentUrl = 'https://connect.stripe.com/express/oauth/authorize?response_type=code&'
        + 'client_id=ca_AlhauL6d5gJ66yM3RaXBHIwt0R8qeb9q&scope=read_write&redirect_uri=' + environment.clientUrl
        + '/console/account/payoutmethods&state=' + environment.clientUrl + '/community/' + this.communityId
        + '/edit/' + this.step;
      this.searchTopicURL = environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics/suggest?field=name&query=';
      this.createTopicURL = environment.apiUrl + '/api/' + environment.uniqueDeveloperCode + '_topics';
    });


    this.userId = _cookieUtilsService.getValue('userId');
    this.options = requestHeaderService.getOptions();

  }

  public ngOnInit() {
    console.log('Inside oninit community');
    this.interest1 = new FormGroup({});

    this.newTopic = this._fb.group({
      topicName: ['', Validators.requiredTrue]
    });

    this.community = this._fb.group({
      type: 'community',
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

    this.paymentInfo = this._fb.group({
      id: ''
    });
    this.initializeFormFields();
    this.initializeCommunity();

    this._CANVAS = <HTMLCanvasElement>document.querySelector('#video-canvas');
    this._VIDEO = document.querySelector('#main-video');
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

      if (this.communityData.status === 'active') {
        this.isWorkShopActive = true;
        this.activeCommunity = 'disabledMAT';
      }
      this.timeline.controls.calendar.patchValue(calendar);
      this.initializeContentForm(res);
    }
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
      date: ['']
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
    } else {
      this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(this.community.value, this.sidebarMenuItems);
      this.sidebarMenuItems[2]['submenu'] = [];
    }
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
    return itenaries;
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

    this.placeholderStringTopic = 'Search for a topic or enter a new one';

    this.key = 'access_token';

    this.countryPickerService.getCountries()
      .subscribe((countries) => this.countries = countries);

    this.languagePickerService.getLanguages()
      .subscribe((languages) => {
        this.languagesArray = _.map(languages, 'name');
        this.filteredLanguageOptions = this.community.controls.selectedLanguage.valueChanges
          .startWith(null)
          .map(val => val ? this.filter(val) : this.languagesArray.slice());
        console.log(this.filteredLanguageOptions);
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
    this.communityVideoPending = true;
    this.communityImage1Pending = true;
  }

  filter(val: string): string[] {
    console.log('filtering');
    return this.languagesArray.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  private initializeCommunity() {
    console.log('Inside init community');
    if (this.communityId) {
      this._collectionService.getCollectionDetail(this.communityId, this.query)
        .subscribe((res) => {
          console.log(res);
          this.communityData = res;
          if (this.communityData.payoutrules && this.communityData.payoutrules.length > 0) {
            this.payoutRuleNodeId = this.communityData.payoutrules[0].id;
            this.payoutRuleAccountId = this.communityData.payoutrules[0].payoutId1;
          }
          this.retrieveAccounts();
          this.initializeFormValues(res);
          this.initializeTimeLine(res);

          if (res.status === 'active') {
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
      // this.community.controls.selectedLanguage.setValue(event.value);
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
    const options = {};
    this.removedInterests = event;
    if (this.removedInterests.length !== 0) {
      this.removedInterests.forEach((topic) => {
        this.http.delete(environment.apiUrl + '/api/collections/' + this.communityId + '/topics/rel/' + topic.id, options)
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
      this.community.controls.selectedLanguage.patchValue(res.language[0]);
    }
    // aboutHost TBD
    this.community.controls.aboutHost.patchValue(res.aboutHost);

    // Title
    this.community.controls.title.patchValue(res.title);

    // Headline
    this.community.controls.headline.patchValue(res.headline);

    // Description
    this.community.controls.description.patchValue(res.description);

    // Difficulty Level
    this.community.controls.difficultyLevel.patchValue(res.difficultyLevel);

    // Notes
    this.community.controls.notes.patchValue(res.notes);

    // Seats
    this.community.controls.maxSpots.patchValue(res.maxSpots);

    // Photos and Videos
    if (res.videoUrls && res.videoUrls.length > 0) {
      this.community.controls['videoUrls'].patchValue(res.videoUrls);
      this.urlForVideo = res.videoUrls;
    }
    if (res.imageUrls && res.imageUrls.length > 0) {
      this.community.controls['imageUrls'].patchValue(res.imageUrls);
      this.urlForImages = res.imageUrls;
    }

    // Currency, Amount, Cancellation Policy
    this.community.controls.price.patchValue(res.price);
    if (res.currency) { this.community.controls.currency.patchValue(res.currency); }
    if (res.cancellationPolicy) { this.community.controls.cancellationPolicy.setValue(res.cancellationPolicy); }

    // Status
    this.community.controls.status.setValue(res.status);

    this.isPhoneVerified = res.owners[0].phoneVerified;

    this.isSubmitted = this.community.controls.status.value === 'submitted';

    if (res.owners[0].profiles[0].phone_numbers && res.owners[0].profiles[0].phone_numbers.length) {
      this.phoneDetails.controls.phoneNo.patchValue(res.owners[0].profiles[0].phone_numbers[0].subscriber_number);
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
  public communityStepUpdate() {
    if (this.community.value.stage < this.step) {
      this.community.patchValue({
        'stage': this.step
      });
    }

  }

  public addImageUrl(value: String) {
    console.log('Adding image url: ' + value);
    this.urlForImages.push(value);
    const control = <FormArray>this.community.controls['imageUrls'];
    this.communityImage1Pending = false;
    control.patchValue(this.urlForImages);
    const tempCommunityData = this.communityData;
    tempCommunityData.imageUrls = this.community.controls['imageUrls'].value;
    this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(tempCommunityData, this.sidebarMenuItems);

  }

  public addVideoUrl(value: String) {
    console.log('Adding video url: ' + value);
    this.urlForVideo.push(value);
    const control = this.community.controls['videoUrls'];
    this.communityVideoPending = false;
    control.patchValue(this.urlForVideo);
    const tempCommunityData = this.communityData;
    tempCommunityData.videoUrls = this.community.controls['videoUrls'].value;
    this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(tempCommunityData, this.sidebarMenuItems);
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
        this.snackBar.open(err.message, 'close', {
          duration: 900
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

  public submitCommunity(data, timeline?, step?) {
    if (this.community.controls.status.value === 'active') {
      this.dialogsService.openCollectionCloneDialog({ type: 'community' })
        .subscribe((result) => {
          if (result === 'accept') {
            this.executeSubmitCommunity(data, timeline, step);
          } else if (result === 'reject') {
            this.router.navigate(['/console/teaching/communities']);
          }
        });
    } else {
      this.executeSubmitCommunity(data, timeline, step);
    }
  }

  private executeSubmitCommunity(data, timeline?, step?) {
    const lang = <FormArray>this.community.controls.language;
    lang.removeAt(0);
    lang.push(this._fb.control(data.value.selectedLanguage));
    const body = data.value;
    delete body.selectedLanguage;

    this._collectionService.patchCollection(this.communityId, body).map(
      (response: any) => {
        const result = response;
        let collectionId;
        if (result.isNewInstance) {
          this.community.controls.status.setValue(result.status);
          collectionId = result.id;
        } else {
          collectionId = this.communityId;
        }
        result.topics = this.communityData.topics;
        result.contents = this.communityData.contents;
        result.owners = this.communityData.owners;
        this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(result, this.sidebarMenuItems);

        if (step && step > 12) {
          this.submitTimeline(collectionId, timeline);
        }
        if (!result.isNewInstance) {
          this.step++;
          this.communityStepUpdate();
        }
        this.router.navigate(['community', collectionId, 'edit', this.step]);

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
        .map((response) => {
          // console.log(this.step);
          // this.step++;
          //  console.log(this.step);
          // this.communityStepUpdate();
          // this.router.navigate(['community', collectionId, 'edit', this.step]);
        })
        .subscribe();
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
    console.log(topicArray);
    body = {
      'targetIds': topicArray
    };

    if (topicArray.length !== 0) {
      let observable: Observable<any>;
      observable = this.http.patch(environment.apiUrl + '/api/collections/' + this.communityId + '/topics/rel', body)
        .map(response => response).publishReplay().refCount();
      observable.subscribe((res) => {
        this.step++;
        this._collectionService.getCollectionDetail(this.communityId, this.query)
          .subscribe((resData) => {
            this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(resData, this.sidebarMenuItems);
          });
        this.communityStepUpdate();
        this.busyInterest = false;
        this.router.navigate(['community', this.communityId, 'edit', this.step]);
      });
    } else {
      this.step++;
      this.communityStepUpdate();
      this.router.navigate(['community', this.communityId, 'edit', this.step]);
    }
    // let observable: Rx.Observable<any>;
    // if (topicArray.length !== 0) {
    //   topicArray.forEach(topicId => {
    //     observable = this._topicService.relTopicCollection(this.communityId, topicId)
    //                   .map(response => response).publishReplay().refCount();
    //     observable.subscribe((res) => {
    //       this.step++;
    //       this._collectionService.getCollectionDetail(this.communityId, this.query)
    //         .subscribe((resData) => {
    //           this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(resData, this.sidebarMenuItems);
    //         });
    //       this.communityStepUpdate();
    //       this.busyInterest = false;
    //       this.router.navigate(['community', this.communityId, 'edit', this.step]);
    //     });
    //   });
    // }
    // else {
    //   this.step++;
    //   this.communityStepUpdate();
    //   this.router.navigate(['community', this.communityId, 'edit', this.step]);
    // }
  }

  /**
   * goto(toggleStep)  */
  public goto(toggleStep) {
    this.busyBasics = false;
    this.busyCommunityPage = false;
    this.step = toggleStep;
    this.router.navigate(['community', this.communityId, 'edit', +toggleStep]);
    if (toggleStep === 2) {
      this.busyBasics = true;
      this.busyBasics = false;
    }
    if (toggleStep === 6) {
      this.busyCommunityPage = true;
    }
  }



  submitForReview() {
    // Post Community for review
    this._collectionService.submitForReview(this.communityId)
      .subscribe((res) => {
        this.community.controls.status.setValue('submitted');
        console.log('Community submitted for review');
        this.isSubmitted = true;
        this.dialogsService.openCollectionSubmitDialog({ type: 'community' });
        // call to get status of community
        if (this.community.controls.status.value === 'active') {
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
    this.communityStepUpdate();
    if (this.step === 13) {
      const data = this.timeline;
      const body = data.value.calendar;
      if (body.startDate && body.endDate) {
        this.http.patch(environment.apiUrl + '/api/collections/' + this.communityId + '/calendar', body, this.options)
          .map((response) => {
            this.busySave = false;
            this.router.navigate(['console/teaching/communities']);
          })
          .subscribe();
      } else {
        console.log('Enter Date!');
      }

    } else {
      const data = this.community;
      const lang = <FormArray>this.community.controls.language;
      lang.removeAt(0);
      lang.push(this._fb.control(data.value.selectedLanguage));
      const body = data.value;
      delete body.selectedLanguage;
      this._collectionService.patchCollection(this.communityId, body).map(
        (response) => {
          this.router.navigate(['console/teaching/communities']);
        }).subscribe();
    }
  }

  exit() {
    this.router.navigate(['console/teaching/communities']);
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
          this.community.controls.selectedLanguage.patchValue(res.name);
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
    this.http.delete(environment.apiUrl + fileUrl)
      .map((response) => {
        console.log(response);
        if (fileType === 'video') {
          this.urlForVideo = _.remove(this.urlForVideo, function (n) {
            return n !== fileurl;
          });
          this.community.controls.videoUrls.patchValue(this.urlForVideo);
        } else if (fileType === 'image') {
          this.urlForImages = _.remove(this.urlForImages, function (n) {
            return n !== fileurl;
          });
          this.community.controls.imageUrls.patchValue(this.urlForImages);
        }
        this.sidebarMenuItems = this._leftSideBarService.updateSideMenu(this.community.value, this.sidebarMenuItems);
      }).subscribe();

  }

  deleteFromContainerArr(event, fileType) {
    for (let i = 0; i < event.target.files.length; i++) {
      let file = event.target.files[i];
      const fileurl = file;
      file = _.replace(file, 'download', 'files');
      this.http.delete(environment.apiUrl + file)
        .map((response) => {
          console.log(response);
          if (fileType === 'video') {
            this.urlForVideo = _.remove(this.urlForVideo, function (n) {
              return n !== fileurl;
            });
            this.community.controls.videoUrls.patchValue(this.urlForVideo);
          } else if (fileType === 'image') {
            this.urlForImages = _.remove(this.urlForImages, function (n) {
              return n !== fileurl;
            });
            this.community.controls.imageUrls.patchValue(this.urlForImages);
          }
        }).subscribe();

    }
  }

  toggleChoice(choice) {
    this.selectedOption = choice;
  }


  submitPhoneNo(element, text) {
    // Call the OTP service
    // Post Community for review

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
        console.log(res);
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
    this.router.navigate(['community', this.communityId, 'edit', this.step]);
  }

  /**
   * Make the dates section of this page editable
   */
  makeDatesEditable() {
    this.datesEditable = true;
  }

  openCommunity() {
    this.busyPreview = true;
    this.router.navigate(['/community', this.communityId]);
    this.busyPreview = false;
  }

  sort(calendars, param1, param2) {
    return _.sortBy(calendars, [param1, param2]);
  }

  private retrieveAccounts() {
    this.payoutAccounts = [];
    this._paymentService.retrieveConnectedAccount().subscribe(result => {
      console.log(result);
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
  }

  private updatePayoutRule(newPayoutId) {
    if (this.payoutRuleNodeId) {
      this.payoutLoading = true;
      this._paymentService.patchPayoutRule(this.payoutRuleNodeId, newPayoutId).subscribe(res => {
        if (res) {
          this.payoutLoading = false;
          this.payoutRuleAccountId = newPayoutId;
          this.snackBar.open('Payout Account Updated', 'close', {
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
      this._paymentService.postPayoutRule(this.communityId, newPayoutId).subscribe((res: any) => {
        if (res) {
          this.payoutLoading = false;
          this.payoutRuleAccountId = newPayoutId;
          this.snackBar.open('Payout Account Added', 'close', {
            duration: 500
          });
          this.payoutRuleNodeId = res.id;
        }
      }, err => {
        this.payoutLoading = false;
        this.snackBar.open('Unable to Add account', 'close', {
          duration: 500
        });
      });

    }
  }

  onFreeChange(event) {
    if (event) {
      this.community.controls['price'].setValue(0);
    }
  }
}

