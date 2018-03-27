import { Component, OnInit, ChangeDetectionStrategy, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import { MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Title } from '@angular/platform-browser';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { ContentService } from '../../_services/content/content.service';
import { CommentService } from '../../_services/comment/comment.service';
import { ViewParticipantsComponent } from './view-participants/view-participants.component';
import { ContentVideoComponent } from './content-video/content-video.component';
import { ContentProjectComponent } from './content-project/content-project.component';
import { ShowRSVPPopupComponent } from './show-rsvp-participants-dialog/show-rsvp-dialog.component';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  subWeeks,
  addWeeks
} from 'date-fns';
import { GetMonthViewArgs, MonthView, getMonthView } from 'calendar-utils';
import { Subject } from 'rxjs/Subject';
import {
  CalendarEvent,
  CalendarDateFormatter,
  CalendarUtils
} from 'angular-calendar';
import { CustomDateFormatter } from '../../_services/dialogs/edit-calendar-dialog/custom-date-formatter.provider';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { TopicService } from '../../_services/topic/topic.service';
import { ContentInpersonComponent } from './content-inperson/content-inperson.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { environment } from '../../../environments/environment';
declare var FB: any;

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

export class MyCalendarUtils extends CalendarUtils {
  getMonthView(args: GetMonthViewArgs): MonthView {
    args.viewStart = subWeeks(startOfMonth(args.viewDate), 1);
    args.viewEnd = addWeeks(endOfMonth(args.viewDate), 1);
    return getMonthView(args);
  }
}

@Component({
  selector: 'app-experience-page',
  templateUrl: './experience-page.component.html',
  styleUrls: ['./experience-page.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    }
  ],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ]
})
export class ExperiencePageComponent implements OnInit {

  public experienceId: string;
  public envVariable;
  public userId;
  public userType: string;
  public totalDuration: string;
  public calendarId: string;
  public userRating: number;
  public newUserRating = 0;
  public liveCohort;
  public isViewTimeHidden = true;
  public busyDiscussion = false;
  public busyReview = false;
  public busyReply = false;
  public initialLoad = true;
  public loggedInUser;
  public isReadonly = true;
  public noOfReviews = 3;
  private initialised = false;
  public bookmark;
  public hasBookmarked = false;
  public replyingToCommentId: string;
  public itenaryArray: Array<any>;
  public experience: any;
  public currentCalendar: any;
  public chatForm: FormGroup;
  public modalContent: any;
  public topicFix: any;
  public messagingParticipant: any;
  public allItenaries: Array<any>;
  public itenariesObj: any;
  public reviews: Array<any>;
  public defaultProfileUrl = '/assets/images/avatar.png';
  public noWrapSlides = true;
  public peerHasSubmission = false;
  public contentHasSubmission: any;
  public participants: Array<any>;
  public peerRsvps: Array<any>;
  public allParticipants: Array<any>;
  public isRatingReceived = false;
  public maxLength = 140;
  public editReviewForm: FormGroup;
  public bookmarking = false;
  public editCommentForm: FormGroup;
  public editReplyForm: FormGroup;

  public replyForm: FormGroup;
  public reviewForm: FormGroup;
  public recommendations = {
    collections: []
  };
  public result;
  public lat;
  public lng;

  public comments: Array<any>;
  private today = moment();

  // Calendar Start
  public dateClicked = false;
  public clickedDate;
  public clickedCohort;
  public clickedCohortId;
  public clickedCohortStartDate;
  public clickedCohortEndDate;
  public eventsForTheDay: any;
  public toOpenDialogName;
  objectKeys = Object.keys;

  public view = 'month';

  public activityMapping:
    { [k: string]: string } = { '=0': 'No activity', '=1': 'One activity', 'other': '# activities' };
  public hourMapping:
    { [k: string]: string } = { '=0': 'Less than an hour', '=1': 'One hour', 'other': '# hours' };
  public projectMapping:
    { [k: string]: string } = { '=0': 'No projects', '=1': 'One project', 'other': '# projects' };
  public inPersonSessionMapping:
    { [k: string]: string } = { '=0': 'No in-person sessions', '=1': 'One in-person session', 'other': '# in-person sessions' };
  public cohortMapping:
    { [k: string]: string } = { '=0': 'No cohort', '=1': 'One cohort', 'other': '# cohorts' };
  public dayMapping:
    { [k: string]: string } = { '=0': 'Less than a day', '=1': 'One day', 'other': '# days' };
  public discussionMapping:
    { [k: string]: string } = { '=0': 'No Comments', '=1': 'One comment', 'other': '# comments' };

  public viewDate: Date = new Date();

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [
  ];


  public carouselImages: Array<string>;

  activeDayIsOpen = true;
  public loadingSimilarExperiences = true;
  public loadingComments = true;
  public loadingParticipants = true;
  public loadingExperience = true;
  public loadingReviews = true;
  public accountApproved = 'false';
  public carouselBanner: any;

  constructor(public router: Router,
    private activatedRoute: ActivatedRoute,
    private _cookieUtilsService: CookieUtilsService,
    public _collectionService: CollectionService,
    public _contentService: ContentService,
    public _topicService: TopicService,
    private _commentService: CommentService,
    private _fb: FormBuilder,
    private dialog: MatDialog,
    private dialogsService: DialogsService,
    private snackBar: MatSnackBar,
    private _authenticationService: AuthenticationService,
    private titleService: Title
    // private location: Location
  ) {
    this.envVariable = environment;
  }

  ngOnInit() {
    this.initializePage();
    // this._authenticationService.getLoggedInUser.subscribe(res => {
    //   delete this.userType;
    //   this.initializePage();
    // });
  }

  initializePage() {
    this.activatedRoute.params.subscribe(params => {
      if (this.initialised && (this.experienceId !== params['collectionId'] || this.calendarId !== params['calendarId'])) {
        location.reload();
      }
      this.experienceId = params['collectionId'];
      this.calendarId = params['calendarId'];
      this.toOpenDialogName = params['dialogName'];
    });
    this.userId = this._cookieUtilsService.getValue('userId');
    console.log('userId is ' + this.userId);
    this.accountApproved = this._cookieUtilsService.getValue('accountApproved');

    this.initialised = true;
    this.initializeExperience();
    this.initializeForms();
    this.initialLoad = false;
    this.eventsForTheDay = {};
    this.carouselBanner = {
      grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
      slide: 1,
      speed: 400,
      interval: 4000,
      point: {
        visible: false
      },
      load: 2,
      loop: true,
      touch: true
    };
  }

  refreshView(): void {
    this.refresh.next();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    this.eventsForTheDay = {};

    if (events.length === 0) {
      this.dateClicked = false;
      return;
    } else {
      this.dateClicked = true; // !this.dateClicked;
    }
    this.clickedDate = date;
    this.clickedCohort = this.parseTitle(events[0].title)[0];
    this.clickedCohortId = this.parseTitle(events[0].title)[1];
    this.clickedCohortStartDate = events[0].start;
    this.clickedCohortEndDate = events[0].end;
    for (const event of events) {
      const titleCalIdArray = this.parseTitle(event.title);
      const calId = titleCalIdArray[1];
      const title = titleCalIdArray[0];
      const type = titleCalIdArray[2];
      const eventId = titleCalIdArray[3];
      if (type !== 'cohort') {
        if (!this.eventsForTheDay.hasOwnProperty(calId)) {
          this.eventsForTheDay[calId] = [{
            id: eventId,
            title: title,
            color: event.color,
            start: event.start,
            end: event.end
          }];
        } else {
          this.eventsForTheDay[calId].push({
            id: eventId,
            title: title,
            color: event.color,
            start: event.start,
            end: event.end
          });
        }
      }
    }
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  // Modal
  public editCalendar() {
    const sortedCalendar = this.sort(this.experience.calendars, 'startDate', 'endDate');

    this.dialogsService
      .editCalendar({ id: this.experienceId, type: this.experience.type, name: this.experience.title },
        this.experience.contents, this.experience.calendars, this.allItenaries, this.allParticipants,
        this.events, this.userId, sortedCalendar[sortedCalendar.length - 1].startDate,
        sortedCalendar[sortedCalendar.length - 1].endDate)
      .subscribe(res => {
        if (res) {
          this.result = res;
          if (this.result.calendarsSaved === 'calendarsSaved') {
            this.initializeExperience();
          }
          if (this.result.cohortDeleted) {
            this.refreshView();
          }
        }
      });
  }

  private initializeUserType() {
    if (this.experience) {
      for (const owner of this.experience.owners) {
        if (owner.id === this.userId) {
          this.userType = 'teacher';
          break;
        }
      }
      if (!this.userType && this.currentCalendar) {
        for (const participant of this.experience.participants) {
          if (participant.id === this.userId) {
            this.userType = 'participant';
            break;
          }
        }
      }
      if (!this.userType) {
        this.userType = 'public';
        if (this.calendarId) {
          this.router.navigate(['experience', this.experienceId]);
        }
      }
      if (this.userType === 'public' || this.userType === 'teacher') {
        this.initializeAllItenaries();
      }

      this.loadingExperience = false;

    }
  }

  private initializeAllItenaries() {
    this.events = [];
    const sortedCalendar = this.sort(this.experience.calendars, 'startDate', 'endDate');
    this.viewDate = new Date(sortedCalendar[sortedCalendar.length - 1].endDate);
    sortedCalendar.forEach((calendar, index) => {
      const calendarItenary = [];
      for (const key in this.itenariesObj) {
        if (this.itenariesObj.hasOwnProperty(key)) {
          const eventDate = this._collectionService.calculateDate(calendar.startDate, key);
          this.itenariesObj[key].sort(function (a, b) {
            return parseFloat(a.schedules[0].startTime) - parseFloat(b.schedules[0].startTime);
          });
          const contentObj = this.processContent(key);
          const itenary = {
            startDay: key,
            startDate: eventDate,
            contents: contentObj
          };
          console.log(itenary);
          calendarItenary.push(itenary);
        }
      }
      this.allItenaries.push(
        {
          calendar: calendar,
          itenary: calendarItenary
        });
      index++;
      this.events.push({
        title: 'Cohort ' + index + ':' + calendar.id + ':cohort:',
        color: colors.red,
        start: moment.utc(calendar.startDate, 'YYYY-MM-DD HH:mm:ss').local().toDate(),
        end: moment.utc(calendar.endDate, 'YYYY-MM-DD HH:mm:ss').local().toDate(),
        cssClass: 'experienceCohortCalendar'
      });
    });
    for (const indvIterinary of this.allItenaries) {
      const calendarId = indvIterinary.calendar.id;
      for (const iterinary of indvIterinary.itenary) {
        const startDate = moment(iterinary.startDate).format('YYYY-MM-DD');
        for (let i = 0; i < iterinary.contents.length; i++) {
          const schedule = iterinary.contents[i].schedules;
          const startTime = moment.utc(schedule[0].startTime).local().format('HH:mm:ss');
          const endTime = moment.utc(schedule[0].endTime).local().format('HH:mm:ss');
          this.events.push({
            title: iterinary.contents[i].title + ':' + calendarId + ':content:' + iterinary.contents[i].id,
            color: colors.red,
            start: moment(startDate + ' ' + startTime, 'YYYY-MM-DD HH:mm:ss').toDate(),
            end: moment(startDate + ' ' + endTime, 'YYYY-MM-DD HH:mm:ss').toDate(),
            cssClass: 'customEventClass'
          });
        }
      }
    }
    this.refreshView();
  }

  private processContent(key) {
    const contentObj = this.itenariesObj[key];
    const self = this;
    if (contentObj) {
      contentObj.forEach(content => {
        content.hasRSVPd = false;
        if (content.rsvps) {
          content.rsvps.forEach(rsvp => {
            if (rsvp.peer) {
              const peer = _.find(rsvp.peer, function (o) { return o.id === self.userId; });
              if (peer) {
                content.hasRSVPd = true;
                return;
              }
            }
          });
        }
      });
    }
    return contentObj;
  }

  private initializeExperience() {
    this.allParticipants = [];
    this.allItenaries = [];
    const query = {
      'include': [
        'topics',
        'calendars',
        'views',
        { 'participants': [{ 'profiles': ['work'] }] },
        { 'owners': [{ 'profiles': ['work'] }] },
        {
          'contents': ['locations', 'schedules', { 'rsvps': 'peer' },
            { 'views': 'peer' }, {
              'submissions': [{ 'upvotes': 'peer' },
              { 'peer': 'profiles' }]
            }]
        }
      ],
      'relInclude': 'calendarId'
    };

    if (this.experienceId) {
      this._collectionService.getCollectionDetail(this.experienceId, query)
        .subscribe(res => {
          console.log(res);
          this.experience = res;
          this.setCurrentCalendar();
          this.itenariesObj = {};
          this.itenaryArray = [];
          // Scan through all contents and group them under their respective start days.
          // Also scan through all contents and check if the user has made submission for a project.
          this.experience.contents.forEach(contentObj => {
            if (this.itenariesObj.hasOwnProperty(contentObj.schedules[0].startDay)) {
              this.itenariesObj[contentObj.schedules[0].startDay].push(contentObj);
            } else {
              this.itenariesObj[contentObj.schedules[0].startDay] = [contentObj];
            }

            if (contentObj.submissions && contentObj.submissions.length > 0) {
              contentObj.submissions.forEach(submission => {
                if (submission.peer) {
                  if (this.userId === submission.peer[0].id) {
                    this.peerHasSubmission = true;
                  }
                }
              });
            }

            if (contentObj.locations && contentObj.locations.length > 0
              && contentObj.locations[0].map_lat !== undefined
              && contentObj.locations[0].map_lng !== undefined) {
              this.lat = parseFloat(contentObj.locations[0].map_lat);
              this.lng = parseFloat(contentObj.locations[0].map_lng);
              console.log('Lat is: ' + this.lat + ' & Lng is: ' + this.lng);
            }
          });
          console.log(this.itenariesObj);
          // Scan through all the start-day-groups of contents
          // Calculate the calendar start and end date of each content group
          // Sort the contents inside a group based on their start times
          // Format the start time and end time of each of the individual content in that group
          // Calculate the viewing metrics of each individual content
          // Set hasRSVPd toggle on each of the content
          // Create an object for the content group with properties: startDay, startDate, endDate and array of contents.
          // Add content group to itinerary array
          for (const key in this.itenariesObj) {
            if (this.itenariesObj.hasOwnProperty(key)) {
              let startDate, endDate;
              if (this.currentCalendar) {
                startDate = this._collectionService.calculateDate(this.currentCalendar.startDate, key);
                endDate = this._collectionService.calculateDate(this.currentCalendar.startDate, key);
              } else {
                startDate = this._collectionService.calculateDate(this.experience.calendars[0].startDate, key);
                endDate = this._collectionService.calculateDate(this.experience.calendars[0].startDate, key);
              }
              this.itenariesObj[key].sort(function (a, b) {
                return parseFloat(a.schedules[0].startTime) - parseFloat(b.schedules[0].startTime);
              });
              this.itenariesObj[key].forEach(content => {
                if (content.schedules[0].startTime !== undefined) {
                  content.schedules[0].startTime = startDate.format().toString().split('T')[0] +
                    'T' + content.schedules[0].startTime.split('T')[1];
                  content.schedules[0].endTime = startDate.format().toString().split('T')[0] +
                    'T' + content.schedules[0].endTime.split('T')[1];
                }
              });
              this.setContentViews(this.itenariesObj[key]);
              const contentObj = this.processContent(key);
              const itenary = {
                startDay: key,
                startDate: startDate,
                endDate: endDate,
                contents: contentObj
              };
              this.itenaryArray.push(itenary);
            }
          }
          // Sort itinerary array in ascending order of content group start days.
          this.itenaryArray.sort(function (a, b) {
            return parseFloat(a.startDay) - parseFloat(b.startDay);
          });
        },
          err => console.log('error'),
          () => {
            this.initializeUserType();
            this.calculateTotalHours();
            this.fixTopics();
            this.getReviews();
            this.getRecommendations();
            this.getParticipants();
            this.getDiscussions();
            this.getBookmarks();
            this.setUpCarousel();
            if (this.toOpenDialogName !== undefined && this.toOpenDialogName !== 'paymentSuccess') {
              this.itenaryArray.forEach(itinerary => {
                itinerary.contents.forEach(content => {
                  if (content.id === this.toOpenDialogName) {
                    this.openDialog(content, itinerary.startDate, itinerary.endDate);
                  }
                });
              });
            } else if (this.toOpenDialogName !== undefined && this.toOpenDialogName === 'paymentSuccess') {
              const snackBarRef = this.snackBar.open('Your payment was successful. Happy learning!', 'Okay', {
                duration: 800
              });
              snackBarRef.onAction().subscribe(() => {
                this.router.navigate(['experience', this.experienceId, 'calendar', this.calendarId]);
                // this.location.replaceState(this.location.host + '/' + 'experience' + '/' +
                // this.experienceId + '/' + 'calendar' + '/' + this.calendarId);
              });
            }
          });
    } else {
      console.log('NO COLLECTION');
    }
  }

  private setUpCarousel() {
    if (this.experience.imageUrls && this.experience.imageUrls.length > 0) {
      this.carouselImages = this.experience.imageUrls.map(url => environment.apiUrl + url);
    }
  }

  private getReviews() {
    this.loadingReviews = true;
    let query = {};
    if (this.calendarId) {
      query = {
        'include': [
          {
            'peer': ['profiles']
          }],
        'where': { 'and': [{ 'collectionId': this.experienceId }, { 'collectionCalendarId': this.calendarId }] }
      };
    } else {
      query = {
        'include': [
          {
            'peer': ['profiles']
          }],
        'where': { 'collectionId': this.experienceId }
      };
    }
    this._collectionService.getReviews(this.experience.owners[0].id, query, (err, response) => {
      if (err) {
        console.log(err);
      } else {
        console.log(response);
        const currentPeerReviews = [];
        const otherPeerReviews = [];
        response.forEach(review => {
          if (this.userId && review.peer[0].id === this.userId) {
            currentPeerReviews.push(review);
          } else {
            otherPeerReviews.push(review);
          }
        });
        this.reviews = currentPeerReviews.concat(otherPeerReviews);
        console.log(this.reviews);
        this.userRating = this._collectionService.calculateRating(this.reviews);
        this.loadingReviews = false;
      }
    });
  }
  public showAll(strLength) {
    if (strLength > this.maxLength) {
      this.maxLength = strLength;
    } else {
      this.maxLength = 140;
    }
  }

  private getBookmarks() {
    const query = {
      'include': [
        {
          'peer': [
            { 'profiles': ['work'] }
          ]
        }
      ],
      'order': 'createdAt DESC'
    };
    this._collectionService.getBookmarks(this.experienceId, query, (err, response) => {
      if (err) {
        console.log(err);
      } else {
        console.log(response);
        this.hasBookmarked = false;
        response.forEach(bookmark => {
          if (bookmark.peer[0].id === this.userId) {
            console.log('user bookmarked');
            this.hasBookmarked = true;
            this.bookmark = bookmark;
          }
        });
      }
    });
  }

  private getDiscussions() {
    this.loadingComments = true;
    const query = {
      'include': [
        {
          'peer': [
            { 'profiles': ['work'] }
          ]
        },
        {
          'replies': [
            {
              'peer': [
                {
                  'profiles': ['work']
                }
              ]
            },
            {
              'upvotes': 'peer'
            }
          ]
        },
        {
          'upvotes': 'peer'
        }
      ],
      'order': 'createdAt DESC'
    };
    this._collectionService.getComments(this.experienceId, query, (err, response) => {
      if (err) {
        console.log(err);
      } else {
        this.comments = response;
        this.loadingComments = false;
      }
    });
  }

  private fixTopics() {
    this.topicFix = _.uniqBy(this.experience.topics, 'id');
  }

  private initializeForms() {
    this.chatForm = this._fb.group({
      description: ['', Validators.required],
      isAnnouncement: [false]
    });
    this.reviewForm = this._fb.group({
      description: ['', Validators.required],
      like: '',
      score: '',
      collectionId: this.experienceId,
      collectionCalendarId: this.calendarId,
    });
  }

  gotoEdit() {
    this.router.navigate(['experience', this.experienceId, 'edit', this.experience.stage ? this.experience.stage : '1']);
  }

  public setCurrentCalendar() {
    if (this.calendarId) {
      const calendarIndex = this.experience.calendars.findIndex(calendar => {
        return calendar.id === this.calendarId;
      });
      if (calendarIndex > -1) {
        this.currentCalendar = this.experience.calendars[calendarIndex];
      } else {
        console.log('Calendar instance not found');
      }
    } else {
      console.log('Calendar id not found');
    }
  }

  /**
   * changeDates
   */
  public changeDates() {
    this.dialogsService.selectDateDialog(this.allItenaries, 'chooseDate', this.allParticipants, this.userType)
      .subscribe(result => {
        if (result) {
          this.router.navigate(['experience', this.experienceId, 'calendar', result]);
        }
      });
  }

  /**
   * cancelExperience
   */
  public cancelExperience() {
    this.dialogsService.openCancelCollection(this.experience).subscribe((response) => {
      if (response) {
        this.router.navigate(['experience', this.experienceId]);
      }
    });
  }

  /**
   * dropoutExperience
   */
  public dropOutExperience() {
    this.dialogsService.openExitCollection(this.experienceId, this.userId).subscribe((response) => {
      if (response) {
        this.router.navigate(['experience', this.experienceId]);
      }
    });
  }

  public cancelCohort() {
    this.dialogsService.openDeleteCohort(this.calendarId).subscribe((res) => {
      if (res) {
        this.router.navigate(['experience', this.experienceId, 'calendar', this.calendarId]);
      }
    }, err => {
      console.log(err);
    });
  }

  public deleteCohort() {
    this.dialogsService.openDeleteCohort(this.calendarId).subscribe(res => {
      if (res) {
        this.router.navigate(['experience', this.experienceId]);
      }
    });
  }

  /**
   * deleteExperience
   */
  public deleteExperience() {
    this.dialogsService.openDeleteCollection(this.experience).subscribe((response) => {
      if (response) {
        this.router.navigate(['/console/teaching/experiences']);
      }
    });
  }



  /**
   * postComment
   */
  public postComment() {
    this.busyDiscussion = true;
    this._collectionService.postComments(this.experienceId, this.chatForm.value, (err, response) => {
      if (err) {
        console.log(err);
      } else {
        this.chatForm.reset();
        this.busyDiscussion = false;
        this.getDiscussions();
      }
    });
  }

  /**
   * saveBookmark
   */
  public saveBookmark() {
    this.bookmarking = true;
    if (!this.hasBookmarked) {
      this._collectionService.saveBookmark(this.experienceId, (err, response) => {
        if (err) {
          console.log(err);
        } else {
          this.snackBar.open('Bookmarked', 'close', {
            duration: 800
          });
          this.getBookmarks();
          this.bookmarking = false;
        }
      });
    } else {
      this._collectionService.removeBookmark(this.bookmark.id, (err, response) => {
        if (err) {
          console.log(err);
        } else {
          this.snackBar.open('Removed Bookmark', 'close', {
            duration: 800
          });
          this.getBookmarks();
          this.bookmarking = false;
        }
      });
    }
  }

  /**
   * calculateTotalHours
   */
  public calculateTotalHours() {
    let totalLength = 0;
    this.experience.contents.forEach(content => {
      if (content.type === 'in-person') {
        const startMoment = moment(content.schedules[0].startTime);
        const endMoment = moment(content.schedules[0].endTime);
        const contentLength = moment.utc(endMoment.diff(startMoment)).format('HH');
        totalLength += parseInt(contentLength, 10);
      } else if (content.type === 'video') {

      }
    });
    this.totalDuration = totalLength.toString();
  }

  /**
   * isLive
   */
  public isLive(content: any) {
    const startMoment = moment(this.currentCalendar.startDate);
    startMoment.add(content.schedules[0].startDay, 'day');
    const endMoment = startMoment.clone();
    endMoment.add(content.schedules[0].endDay, 'day');
    const currentMoment = moment();

    const startTime = moment(content.schedules[0].startTime);
    const endTime = moment(content.schedules[0].endTime);

    startMoment.hours(startTime.hours());
    startMoment.minutes(startTime.minutes());

    endMoment.hours(endTime.hours());
    endMoment.minutes(endTime.minutes());

    if (currentMoment.isBetween(startMoment, endMoment)) {
      content.isLive = true;
      return true;
    } else {
      this.timetoSession(content);
      return false;
    }
  }

  public hasRSVPd(content) {
    // TODO: check if the user has RSVPd for this content
    console.log('called');
  }

  rsvpContent(contentId) {
    this._contentService.createRSVP(contentId, this.calendarId)
      .subscribe((response: any) => {
        console.log(response);
        this.initializeExperience();
      });
  }

  public viewRSVPs(content, userType) {
    let attendies = this.allParticipants;
    if (content.rsvps) {
      content.rsvps.forEach(rsvp => {
        if (rsvp.peer) {
          const peer = rsvp.peer[0];
          const peerFound = _.find(attendies, function (o) { return o.id === peer.id; });
          if (peerFound) {
            peerFound.hasRSVPd = true;
            peerFound.rsvpId = rsvp.id;
            peerFound.isPresent = rsvp.isPresent;
            return;
          }
        }
      });
    }
    attendies = _.filter(attendies, function (o) { return o.hasRSVPd; });
    // TODO: view all RSVPs for this content
    const dialogRef = this.dialog.open(ShowRSVPPopupComponent, {
      data: {
        userType: userType,
        contentId: content.id,
        attendies: attendies,
        experience: this.experienceId
      },
      width: '45vw',
      height: '90vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        location.reload();
      }
    });
  }

  public getDirections(content) {
    // TODO: get directions to this content location
  }


  public getContentCount(type: string) {
    let count = 0;
    for (const content of this.experience.contents) {
      if (content.type === type) {
        count++;
      }
    }
    return count;
  }

  /**
   * toggleReviews
   */
  public toggleReviews() {
    if (this.noOfReviews === 3) {
      this.noOfReviews = 100;
    } else {
      this.noOfReviews = 3;
    }
  }

  viewParticipants() {
    const dialogRef = this.dialog.open(ViewParticipantsComponent, {
      data: {
        participants: this.participants,
        experienceId: this.experienceId,
        userType: this.userType
      },
      width: '45vw',
      height: '100vh'
    });
  }

  viewAllParticipants() {
    const dialogRef = this.dialog.open(ViewParticipantsComponent, {
      data: {
        participants: this.allParticipants,
        experienceId: this.experienceId
      },
      width: '45vw',
      height: '100vh'
    });
  }

  /**
  * openDialog
  content:any   */
  public openDialog(content: any, startDate, endDate) {
    this.modalContent = content;
    switch (content.type) {
      case 'in-person':
        {
          const dialogRef = this.dialog.open(ContentInpersonComponent, {
            data: {
              content: content,
              startDate: startDate,
              endDate: endDate,
              userType: this.userType,
              collectionId: this.experienceId,
              collection: this.experience,
              calendarId: this.calendarId
            },
            width: '45vw',
            height: '100vh'
          });
          break;
        }
      case 'video':
        {
          const dialogRef = this.dialog.open(ContentVideoComponent, {
            data: {
              content: content,
              startDate: startDate,
              endDate: endDate,
              userType: this.userType,
              collectionId: this.experienceId,
              collection: this.experience,
              calendarId: this.calendarId
            },
            width: '45vw',
            height: '100vh'
          });
          break;
        }
      case 'project':
        {
          const dialogRef = this.dialog.open(ContentProjectComponent, {
            data: {
              content: content,
              startDate: startDate,
              endDate: endDate,
              userType: this.userType,
              peerHasSubmission: this.peerHasSubmission,
              collectionId: this.experienceId,
              collection: this.experience,
              calendarId: this.calendarId
            },
            width: '45vw',
            height: '100vh'
          });
          dialogRef.afterClosed().subscribe(res => {
            if (res) {
              this.initializePage();
            }
          });
          break;
        }
      default:
        break;
    }

  }

  /**
  * timetoSession
  content:any   */
  public timetoSession(content: any) {
    const startMoment = moment(this.currentCalendar.startDate);
    startMoment.add(content.schedules[0].startDay, 'day');
    const endMoment = startMoment.clone();
    endMoment.add(content.schedules[0].endDay, 'day');
    const currentMoment = moment();

    const startTime = moment(content.schedules[0].startTime);
    const endTime = moment(content.schedules[0].endTime);

    startMoment.hours(startTime.hours());
    startMoment.minutes(startTime.minutes());

    endMoment.hours(endTime.hours());
    endMoment.minutes(endTime.minutes());

    if (startMoment.diff(currentMoment, 'minutes') < 0) {
      content.timetoSession = 'Completed ' + endMoment.fromNow();
    } else {
      content.timetoSession = 'We will remind you ' + startMoment.fromNow();
    }
  }

  /**
   * getRecommendations
   */
  public getRecommendations() {
    this.loadingSimilarExperiences = true;
    const query = {
      'include': [
        {
          'relation': 'collections', 'scope': {
            'include':
              [{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'calendars',
              { 'contents': 'locations' }], 'where': { 'type': 'experience' }
          }
        }
      ]
    };
    this._topicService.getTopics(query).subscribe(
      (response) => {
        for (const responseObj of response) {
          responseObj.collections.forEach(collection => {
            let experienceLocation = 'Unknown location';
            if (collection.status === 'active' && collection.id !== this.experienceId) {
              if (collection.contents) {
                collection.contents.forEach(content => {
                  if (content.locations && content.locations.length > 0 &&
                    content.locations[0].city !== undefined && content.locations[0].city.length > 0) {
                    experienceLocation = content.locations[0].city;
                  }
                });
                collection.location = experienceLocation;
              }
              if (collection.owners && collection.owners[0].reviewsAboutYou) {
                collection.rating = this._collectionService.calculateCollectionRating(collection.id, collection.owners[0].reviewsAboutYou);
                collection.ratingCount = this._collectionService.calculateCollectionRatingCount(collection.id,
                  collection.owners[0].reviewsAboutYou);
              }
              let hasActiveCalendar = false;
              if (collection.calendars) {
                collection.calendars.forEach(calendar => {
                  if (moment(calendar.startDate).diff(this.today, 'days') >= -1) {
                    hasActiveCalendar = true;
                    return;
                  }
                });
              }
              if (hasActiveCalendar) {
                this.recommendations.collections.push(collection);
              }
            }
          });
        }
        this.recommendations.collections = _.uniqBy(this.recommendations.collections, 'id');
        this.recommendations.collections = _.orderBy(this.recommendations.collections, ['createdAt'], ['desc']);
        this.recommendations.collections = _.chunk(this.recommendations.collections, 5)[0];
        this.loadingSimilarExperiences = false;
      }, (err) => {
        console.log(err);
      }
    );
  }

  /**
   * selectJoiningDates
   */
  public selectJoiningDates() {

    this.dialogsService.selectDateDialog(this.allItenaries, 'chooseDate', this.allParticipants, this.userType)
      .subscribe(result => {
        if (result) {
          if (this.userId) {
            if (this.experience.price === 0) {
              this.joinExperience(result);
            } else {
              this.router.navigate(['review-pay', 'collection', this.experienceId, result]);
            }

          } else {
            this.router.navigate(['login']);
          }
        }
      });
  }

  private joinExperience(calendarId: string) {
    this._collectionService.addParticipant(this.experienceId, this.userId, calendarId, (err: any, response: any) => {
      if (err) {
        console.log(err);
      } else {
        this.router.navigate(['experience', this.experienceId, 'calendar', calendarId]);
      }
    });
  }

  private extractTime(dateString: string) {
    const time = moment.utc(dateString).local().format('HH:mm:ss');
    return time;
  }

  public viewDetails(key) {
    this.router.navigate(['experience', this.experienceId, 'calendar', key]);
  }

  public openEventDialog(calendarId, eventId) {
    this.router.navigate(['experience', this.experienceId, 'calendar', calendarId, eventId]);
  }

  public createReplyForm(comment: any) {
    this.replyingToCommentId = comment.id;
    this.replyForm = this._fb.group({
      description: ''
    });
  }

  /**
   * postReply
   */
  public postReply(comment: any) {
    this.busyReply = true;
    this._commentService.replyToComment(comment.id, this.replyForm.value).subscribe(
      response => {
        this.busyReply = false;
        this.getDiscussions();
        delete this.replyForm;
      }, err => {
        this.busyReply = false;
        console.log(err);
      }
    );
  }

  /**
   * deleteReply
   */
  public deleteReply(reply: any) {
    this._commentService.deleteReply(reply.id).subscribe(
      response => {
        this.getDiscussions();
      }, err => {
        console.log(err);
      }
    );
  }

  /**
   * deleteComment
   */
  public deleteComment(comment: any) {
    this._commentService.deleteComment(comment.id).subscribe(
      response => {
        this.getDiscussions();
      }, err => {
        console.log(err);
      }
    );
  }

  /**
   * deleteReview
   */
  public deleteReview(review: any) {
    this._collectionService.deleteReview(review.id).subscribe(
      response => {
        this.getReviews();
      }, err => {
        console.log(err);
      }
    );
  }

  /**
   * handleRate
   */
  public handleRate(event) {
    this.reviewForm.controls['score'].setValue(event.value);
    this.isRatingReceived = true;
  }

  public updateRating(event) {
    this.editReviewForm.controls['score'].setValue(event.value);
  }

  /**
   * postReview
   */
  public postReview() {
    this.busyReview = true;
    this._collectionService.postReview(this.experience.owners[0].id, this.reviewForm.value).subscribe(
      result => {
        if (result) {
          this.busyReview = false;
          this.getReviews();
        }
      }, err => {
        this.busyReview = false;
        console.log(err);
      }
    );
  }

  public updateReview() {
    this.busyReview = true;
    const reviewBody = this.editReviewForm.value;
    const reviewId = reviewBody.id;
    reviewBody.score = this.newUserRating;
    delete reviewBody.id;
    this._collectionService.updateReview(reviewId, reviewBody).subscribe(
      result => {
        if (result) {
          this.busyReview = false;
          delete this.editReviewForm;
          this.getReviews();
        }
      }, err => {
        this.busyReview = false;
        console.log(err);
      }
    );
  }

  public updateComment() {
    this.busyDiscussion = true;
    const commentBody = this.editCommentForm.value;
    const commentId = commentBody.id;
    delete commentBody.id;
    this._collectionService.updateComment(commentId, commentBody).subscribe(
      result => {
        if (result) {
          this.busyDiscussion = false;
          delete this.editCommentForm;
          this.getDiscussions();
        }
      }, err => {
        this.busyDiscussion = false;
        console.log(err);
      }
    );
  }

  public updateReply() {
    this.busyReply = true;
    const replyBody = this.editReplyForm.value;
    const replyId = replyBody.id;
    delete replyBody.id;
    this._commentService.updateReply(replyId, replyBody).subscribe(
      result => {
        if (result) {
          this.busyReply = false;
          delete this.editReplyForm;
          this.getDiscussions();
        }
      }, err => {
        this.busyReply = false;
        console.log(err);
      }
    );
  }

  addCommentUpvote(comment: any) {
    this._commentService.addCommentUpvote(comment.id, {}).subscribe(
      response => {
        if (comment.upvotes !== undefined) {
          comment.upvotes.push(response);
        } else {
          comment.upvotes = [];
          comment.upvotes.push(response);
        }
      }, err => {
        console.log(err);
      }
    );
  }

  addReplyUpvote(reply: any) {
    this._commentService.addReplyUpvote(reply.id, {}).subscribe(
      response => {
        if (reply.upvotes !== undefined) {
          reply.upvotes.push(response);
        } else {
          reply.upvotes = [];
          reply.upvotes.push(response);
        }
      }, err => {
        console.log(err);
      }
    );
  }

  public getParticipants() {
    this.participants = [];
    this.loadingParticipants = true;
    const query = {
      'relInclude': 'calendarId',
      'include': ['profiles', 'reviewsAboutYou', 'ownedCollections']
    };
    let isCurrentUserParticipant = false;
    let currentUserParticipatingCalendar = '';
    this._collectionService.getParticipants(this.experienceId, query).subscribe(
      (response: any) => {
        this.allParticipants = response;
        for (const responseObj of response) {
          if (this.calendarId && this.calendarId === responseObj.calendarId) {
            this.participants.push(responseObj);
          }
          if (this.calendarId === undefined && responseObj.id === this.userId) {
            // current user is a participant of this experience
            isCurrentUserParticipant = true;
            currentUserParticipatingCalendar = responseObj.calendarId;
          }
          if (responseObj.id === this.userId) {
            this.loggedInUser = responseObj;
          }
        }
        if (isCurrentUserParticipant) {
          this.router.navigate(['experience', this.experienceId, 'calendar', currentUserParticipatingCalendar]);
        }
        this.loadingParticipants = false;
      }, (err) => {
        console.log(err);
      }
    );
  }

  public hasUpvoted(upvotes) {
    let result = false;
    if (upvotes !== undefined) {
      upvotes.forEach(upvote => {
        if (upvote.peer !== undefined) {
          if (upvote.peer[0].id === this.userId) {
            result = true;
          }
        } else {
          result = true;
        }
      });
    }
    return result;
  }

  public isMyComment(comment) {
    return comment.peer[0].id === this.userId;
  }

  public hasReviewed(reviews) {
    let result = false;
    reviews.forEach(review => {
      if (review.peer[0].id === this.userId) {
        result = true;
      }
    });
    return result;
  }

  public isMyReview(review) {
    return review.peer[0].id === this.userId;
  }

  public hasCohortEnded() {
    const cohortEndDate = moment(this.currentCalendar.endDate);
    const currentDate = moment();
    return cohortEndDate.diff(currentDate) > 0;
  }

  public hasLiveCohort() {
    let result = false;
    this.experience.calendars.forEach(calendar => {
      const cohortStartDate = moment(calendar.startDate);
      const cohortEndDate = moment(calendar.endDate);
      const currentMoment = moment();
      if (currentMoment.isBetween(cohortStartDate, cohortEndDate)) {
        this.liveCohort = calendar;
        result = true;
      } else {
        result = false;
      }
    });
    return result;
  }

  public hasUpcomingCohort() {
    let result = false;
    this.experience.calendars.forEach(calendar => {
      const cohortStartDate = moment(calendar.startDate);
      const cohortEndDate = moment(calendar.endDate);
      const currentMoment = moment();
      result = cohortStartDate.diff(currentMoment, 'seconds') > 0;
    });
    return result;
  }

  public shareOnFb() {
    FB.ui({
      method: 'share'
    }, function (response) {
      // Debug response (optional)
      console.log(response);
    });
  }

  public shareOnTwitter() {
    // TODO twitter sharing code
  }

  public hasDatePassed(date) {
    const eventDate = moment(date);
    const currentDate = moment();
    return (this.calendarId !== undefined && eventDate.diff(currentDate, 'seconds') < 0) && this.oneDay();
  }

  public setContentViews(contents) {
    contents.forEach(content => {
      if (content.type !== 'project' && content.views !== undefined) {
        const thisUserView = [];
        let totalUserViewTime = 0;
        content.views.forEach(view => {
          if (view.peer[0].id === this.userId && view.endTime !== undefined) {
            thisUserView.push(view);
            const startTime = moment(view.startTime);
            const endTime = moment(view.endTime);
            console.log(endTime.toString());
            const thisViewTime = endTime.diff(startTime);
            console.log(thisViewTime);
            totalUserViewTime += thisViewTime;
          }
        });
        content.views = thisUserView;
        content.totalUserViewTime = 'Viewed for ' + Math.floor(totalUserViewTime / 60000) + ' minutes';
        content.isViewTimeHidden = true;
      } else if (content.type === 'project' && content.submissions !== undefined) {
        const thisUserView = [];
        let totalUserViewTime;
        content.submissions.forEach(submission => {
          if (submission.peer[0].id === this.userId) {
            thisUserView.push(submission);
            const startTime = moment(submission.createdAt);
            const endTime = moment();
            totalUserViewTime = startTime.from(endTime);
            content.views = thisUserView;
            content.totalUserViewTime = 'Submitted ' + totalUserViewTime;
            content.isViewTimeHidden = true;
          }
        });
      }
    });
  }

  public showViewTime(content) {
    if (this.userType === 'participant') {
      content.isViewTimeHidden = false;
    }
  }

  public hideViewTime(content) {
    if (this.userType === 'participant') {
      content.isViewTimeHidden = true;
    }
  }

  public openVerificationPage() {
    this.router.navigate(['console', 'profile', 'verification']);
  }

  public openLoginPage() {
    this.router.navigate(['login']);
  }

  public openProfilePage(peerId) {
    this.router.navigate(['profile', peerId]);
  }

  public openInviteFriendsDialog() {
    this.dialogsService.inviteFriends(this.experience);
  }

  private sort(calendars, param1, param2) {
    return _.sortBy(calendars, [param1, param2]);
  }


  scrollToDiscussion() {
    const el = document.getElementById('discussionTarget');
    el.scrollIntoView();
  }

  add1ToIndex(index) {
    return 'Day ' + (+index + 1);
  }

  oneDay() {
    return true;
    // return this.itenaryArray.length > 1;
  }

  displayNone() {
    return 'display: none';
  }

  public parseTitle(title) {
    return title.split(':');
  }

  public backToCollection(collection) {
    this.router.navigate([collection.type, collection.id]);
  }

  public editReview(review: any) {
    this.editReviewForm = this._fb.group({
      description: [review.description, Validators.required],
      like: review.like,
      score: review.score,
      collectionId: review.collectionId,
      collectionCalendarId: review.collectionCalendarId,
      id: review.id
    });
    this.newUserRating = review.score;
  }

  public editComment(comment: any) {
    this.editCommentForm = this._fb.group({
      description: [comment.description, Validators.required],
      isAnnouncement: [comment.isAnnouncement],
      id: comment.id
    });
  }

  public editReply(reply: any) {
    console.log(reply);
    this.editReplyForm = this._fb.group({
      description: reply.description,
      id: reply.id
    });
  }

}
