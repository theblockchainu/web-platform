import { Component, OnInit, ChangeDetectionStrategy, ViewContainerRef, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import { MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Title, Meta } from '@angular/platform-browser';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { ContentService } from '../../_services/content/content.service';
import { CommentService } from '../../_services/comment/comment.service';
import { ContentVideoComponent } from './content-video/content-video.component';
import { ContentProjectComponent } from './content-project/content-project.component';
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
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { environment } from '../../../environments/environment';
import { SocketService } from '../../_services/socket/socket.service';
import { AssessmentService } from '../../_services/assessment/assessment.service';
import { ContentOnlineComponent } from './content-online/content-online.component';
import { UcWordsPipe } from 'ngx-pipes';
import { CertificateService } from '../../_services/certificate/certificate.service';

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
	selector: 'app-class-page',
	templateUrl: './class-page.component.html',
	styleUrls: ['./class-page.component.scss'],
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
export class ClassPageComponent implements OnInit, OnDestroy {

	public classId: string;
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
	public class: any;
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
	public allParticipants: Array<any>;
	public isRatingReceived = false;
	public maxLength = 140;
	public editReviewForm: FormGroup;
	public bookmarking = false;
	public editCommentForm: FormGroup;
	public editReplyForm: FormGroup;
	certificateHTML: string;
	loadingCertificate: boolean;

	public replyForm: FormGroup;
	public reviewForm: FormGroup;
	public recommendations = {
		collections: []
	};
	public result;

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
	public checkingEthereum = true;
	public isOnEthereum = false;
	objectKeys = Object.keys;
	public previewAs: string;

	public view = 'month';

	public activityMapping:
		{ [k: string]: string } = { '=0': 'No activity', '=1': 'One activity', 'other': '# activities' };
	public hourMapping:
		{ [k: string]: string } = { '=0': 'Less than an hour of learning', '=1': 'One hour of learning', 'other': '# hours of learning' };
	public projectMapping:
		{ [k: string]: string } = { '=0': 'No project', '=1': 'One project', 'other': '# projects' };
	public onlineSessionMapping:
		{ [k: string]: string } = { '=0': 'No live activity', '=1': 'One live activity', 'other': '# online activity' };
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
	public loadingSimilarClasses = true;
	public loadingComments = true;
	public loadingParticipants = true;
	public loadingClass = true;
	public loadingReviews = true;
	public accountApproved = 'false';
	public carouselBanner: any;
	public startedView;
	public inviteLink = '';
	public assessmentRules: Array<any>;

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
		private _socketService: SocketService,
		private _authenticationService: AuthenticationService,
		private titleService: Title,
		private metaService: Meta,
		private _assessmentService: AssessmentService,
		private ucwords: UcWordsPipe,
		private certificateService: CertificateService

		// private location: Location
	) {
		this.envVariable = environment;
	}

	ngOnInit() {
		this.initializePage();
	}

	ngOnDestroy() {
		if (this.startedView) {
			this.startedView.viewer = {
				id: this.userId
			};
			this.startedView.endTime = new Date();
			this._socketService.sendEndView(this.startedView);
			this._socketService.listenForViewEnded().subscribe(endedView => {
				delete this.startedView;
				console.log(endedView);
			});
		}
	}

	initializePage() {
		this.activatedRoute.params.subscribe(params => {
			if (this.initialised && (this.classId !== params['collectionId'] || this.calendarId !== params['calendarId'])) {
				location.reload();
			}
			this.classId = params['collectionId'];
			this.calendarId = params['calendarId'];
			this.toOpenDialogName = params['dialogName'];
		});
		this.activatedRoute.queryParams.subscribe(params => {
			if (params['previewAs']) {
				this.previewAs = params['previewAs'];
				console.log('Previewing as ' + this.previewAs);
			}
		});
		this.userId = this._cookieUtilsService.getValue('userId');
		console.log('userId is ' + this.userId);
		this.accountApproved = this._cookieUtilsService.getValue('accountApproved');

		this.initialised = true;
		this.initializeClass();
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
		const sortedCalendar = this.sort(this.class.calendars, 'startDate', 'endDate');

		this.dialogsService
			.editCalendar({ id: this.classId, type: this.class.type, name: this.class.title },
				this.class.contents, this.class.calendars, this.allItenaries, this.allParticipants,
				this.events, this.userId, sortedCalendar[sortedCalendar.length - 1].startDate,
				sortedCalendar[sortedCalendar.length - 1].endDate)
			.subscribe(res => {
				if (res) {
					this.result = res;
					if (this.result.calendarsSaved === 'calendarsSaved') {
						this.initializeClass();
					}
					if (this.result.cohortDeleted) {
						this.refreshView();
					}
				}
			});
	}

	private initializeUserType() {
		if (this.class) {
			if (this.previewAs) {
				this.userType = this.previewAs;
			} else {
				for (const owner of this.class.owners) {
					if (owner.id === this.userId) {
						this.userType = 'teacher';
						break;
					}
				}
				if (!this.userType && this.currentCalendar) {
					for (const participant of this.class.participants) {
						if (participant.id === this.userId) {
							this.userType = 'participant';
							break;
						}
					}
				}
				if (!this.userType) {
					this.userType = 'public';
					if (this.calendarId) {
						this.router.navigate(['class', this.classId]);
					}
				}
			}
			if (this.userType === 'public' || this.userType === 'teacher') {
				this.initializeAllItenaries();
			}

			this.loadingClass = false;

		}
	}

	private initializeAllItenaries() {
		this.events = [];
		const sortedCalendar = this.sort(this.class.calendars, 'startDate', 'endDate');
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
				cssClass: 'classCohortCalendar'
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
								content.rsvpId = rsvp.id;
								return;
							}
						}
					});
				}
			});
		}
		return contentObj;
	}

	private initializeClass() {
		this.loadingCertificate = true;
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
				},
				'rooms',
				{ 'assessment_models': [{ 'assessment_na_rules': { 'assessment_result': 'assessees' } }, { 'assessment_rules': { 'assessment_result': 'assessees' } }] }
			],
			'relInclude': 'calendarId'
		};

		if (this.classId) {
			this._collectionService.getCollectionEthereumInfo(this.classId, {})
				.subscribe(res => {
					this.checkingEthereum = false;
					if (res && res[6] && res[6] !== '0') {
						this.isOnEthereum = true;
					}
				});
			this._collectionService.getCollectionDetail(this.classId, query)
				.subscribe(res => {
					console.log(res);
					this.class = res;
					this.inviteLink = environment.clientUrl + '/class/' + this.class.id;
					this.setTags();
					this.setCurrentCalendar();
					this.itenariesObj = {};
					this.itenaryArray = [];
					// Scan through all contents and group them under their respective start days.
					// Also scan through all contents and check if the user has made submission for a project.
					this.class.contents.forEach(contentObj => {
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
								startDate = this._collectionService.calculateDate(this.class.calendars[0].startDate, key);
								endDate = this._collectionService.calculateDate(this.class.calendars[0].startDate, key);
							}
							this.itenariesObj[key].sort(function (a, b) {
								return moment(a.schedules[0].startTime).diff(moment(b.schedules[0].startTime));
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
						this.getCertificatetemplate();
						this.sortAssessmentRules();

						if (this.toOpenDialogName !== undefined && this.toOpenDialogName !== 'paymentSuccess') {
							this.itenaryArray.forEach(itinerary => {
								itinerary.contents.forEach(content => {
									if (content.id === this.toOpenDialogName) {
										this.openDialog(content, itinerary.startDate, itinerary.endDate);
									}
								});
							});
						} else if (this.toOpenDialogName !== undefined && this.toOpenDialogName === 'paymentSuccess') {
							const snackBarRef = this.snackBar.open('Your payment was successful. Happy learning!', 'Okay', { duration: 5000 });
							snackBarRef.onAction().subscribe();
						}
						this.recordStartView();
					});
		} else {
			console.log('NO COLLECTION');
		}
	}

	private setTags() {
		this.titleService.setTitle(this.ucwords.transform(this.class.title));
		this.metaService.updateTag({
			property: 'og:title',
			content: this.class.title
		});
		this.metaService.updateTag({
			property: 'og:description',
			content: this.class.description
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'peerbuds.com'
		});
		if (this.class.imageUrls) {
			this.metaService.updateTag({
				property: 'og:image',
				content: environment.apiUrl + this.class.imageUrls[0]
			});
		}
		this.metaService.updateTag({
			property: 'og:url',
			content: environment.clientUrl + this.router.url
		});
	}

	private setUpCarousel() {
		if (this.class.imageUrls && this.class.imageUrls.length > 0) {
			this.carouselImages = this.class.imageUrls.map(url => environment.apiUrl + url);
		}
	}

	private recordStartView() {
		// Send start view msg on socket
		const view = {
			type: 'user',
			url: this.router.url,
			ip_address: '',
			browser: '',
			viewedModelName: 'collection',
			startTime: new Date(),
			collection: this.class,
			viewer: {
				id: this.userId
			}
		};
		this._socketService.sendStartView(view);
		this._socketService.listenForViewStarted().subscribe(startedView => {
			this.startedView = startedView;
			console.log(startedView);
		});
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
				'where': { 'and': [{ 'collectionId': this.classId }, { 'collectionCalendarId': this.calendarId }] }
			};
		} else {
			query = {
				'include': [
					{
						'peer': ['profiles']
					}],
				'where': { 'collectionId': this.classId }
			};
		}
		this._collectionService.getReviews(this.class.owners[0].id, query, (err, response) => {
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
		this._collectionService.getBookmarks(this.classId, query, (err, response) => {
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
		this._collectionService.getComments(this.classId, query, (err, response) => {
			if (err) {
				console.log(err);
			} else {
				this.comments = response;
				this.loadingComments = false;
			}
		});
	}

	private fixTopics() {
		this.topicFix = _.uniqBy(this.class.topics, 'id');
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
			collectionId: this.classId,
			collectionCalendarId: this.calendarId,
		});
	}

	gotoEdit() {
		this.router.navigate(['class', this.classId, 'edit', this.class.stage ? this.class.stage : '1']);
	}

	public setCurrentCalendar() {
		if (this.calendarId) {
			const calendarIndex = this.class.calendars.findIndex(calendar => {
				return calendar.id === this.calendarId;
			});
			if (calendarIndex > -1) {
				this.currentCalendar = this.class.calendars[calendarIndex];
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
		this.dialogsService.selectDateDialog(this.allItenaries, 'chooseDate', this.allParticipants, this.userType, this.class.type, this.class.maxSpots, this.accountApproved, this.userId)
			.subscribe(result => {
				if (result) {
					this.router.navigate(['class', this.classId, 'calendar', result]);
				}
			});
	}

	/**
	 * cancelClass
	 */
	public cancelClass() {
		this.dialogsService.openCancelCollection(this.class).subscribe((response) => {
			if (response) {
				this.initializePage();
			}
		});
	}

	/**
	 * dropoutClass
	 */
	public dropOutClass() {
		this.dialogsService.openExitCollection(this.classId, this.userId).subscribe((response) => {
			if (response) {
				this.initializePage();
			}
		});
	}

	public cancelCohort() {
		this.dialogsService.openDeleteCohort(this.calendarId).subscribe((res) => {
			if (res) {
				this.initializePage();
			}
		}, err => {
			console.log(err);
		});
	}

	public deleteCohort() {
		this.dialogsService.openDeleteCohort(this.calendarId).subscribe(res => {
			if (res) {
				this.initializePage();
			}
		});
	}

	/**
	 * deleteClass
	 */
	public deleteClass() {
		this.dialogsService.openDeleteCollection(this.class).subscribe((response) => {
			if (response) {
				this.router.navigate(['/console/teaching/classes']);
			}
		});
	}



	/**
	 * postComment
	 */
	public postComment() {
		this.busyDiscussion = true;
		this._collectionService.postComments(this.classId, this.chatForm.value, (err, response) => {
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
			this._collectionService.saveBookmark(this.classId, (err, response) => {
				if (err) {
					console.log(err);
				} else {
					this.snackBar.open('Bookmarked', 'Close', {
						duration: 5000
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
					this.snackBar.open('Removed Bookmark', 'Close', {
						duration: 5000
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
		this.class.contents.forEach(content => {
			if (content.type === 'online') {
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


	public getContentCount(type: string) {
		let count = 0;
		for (const content of this.class.contents) {
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
		this.dialogsService.viewParticipantstDialog(this.participants, this.classId, this.userId).subscribe();
	}

	viewAllParticipants() {
		this.dialogsService.viewParticipantstDialog(this.allParticipants, this.classId).subscribe();
	}

	/**
	 * openDialog
	 content:any   */
	public openDialog(content: any, startDate, endDate) {
		this.modalContent = content;
		switch (content.type) {
			case 'online':
				{
					const dialogRef = this.dialog.open(ContentOnlineComponent, {
						data: {
							content: content,
							startDate: startDate,
							endDate: endDate,
							userType: this.userType,
							collectionId: this.classId,
							collection: this.class,
							calendarId: this.calendarId
						},
						panelClass: 'responsive-dialog',
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
							collectionId: this.classId,
							collection: this.class,
							calendarId: this.calendarId
						},
						panelClass: 'responsive-dialog',
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
							collectionId: this.classId,
							collection: this.class,
							calendarId: this.calendarId
						},
						panelClass: 'responsive-dialog',
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
		this.loadingSimilarClasses = true;
		const query = {
			'include': [
				{
					'relation': 'collections', 'scope': {
						'include':
							[{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'calendars', 'participants',
							{ 'contents': 'locations' }], 'where': { 'type': 'class' }
					}
				}
			]
		};
		this._topicService.getTopics(query).subscribe(
			(response) => {
				for (const responseObj of response) {
					responseObj.collections.forEach(collection => {
						if (collection.status === 'active' && collection.id !== this.classId) {
							if (collection.owners && collection.owners[0].reviewsAboutYou) {
								collection.rating = this._collectionService
									.calculateCollectionRating(collection.id, collection.owners[0].reviewsAboutYou);
								collection.ratingCount = this._collectionService
									.calculateCollectionRatingCount(collection.id, collection.owners[0].reviewsAboutYou);
							}
							let hasActiveCalendar = false;
							if (collection.calendars) {
								collection.calendars.forEach(calendar => {
									if (moment(calendar.endDate).diff(this.today, 'days') >= -1) {
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
				this.loadingSimilarClasses = false;
			}, (err) => {
				console.log(err);
			}
		);
	}

	/**
	 * selectJoiningDates
	 */
	public selectJoiningDates() {

		this.dialogsService.selectDateDialog(this.allItenaries, 'chooseDate', this.allParticipants, this.userType, this.class.type, this.class.maxSpots, this.accountApproved, this.userId)
			.subscribe(result => {
				if (result) {
					if (this.userId) {
						this.router.navigate(['review-pay', 'collection', this.classId, result]);
					} else {
						// this.router.navigate(['sign-up']);
						const returnTo = 'review-pay/collection/' + this.classId + '/' + result;
						this.openSignup(returnTo);
					}
				}
			});
	}

	private extractTime(dateString: string) {
		const time = moment.utc(dateString).local().format('HH:mm:ss');
		return time;
	}

	public viewDetails(key) {
		this.router.navigate(['class', this.classId, 'calendar', key]);
	}

	public openEventDialog(calendarId, eventId) {
		this.router.navigate(['class', this.classId, 'calendar', calendarId, eventId]);
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
		this._collectionService.postReview(this.class.owners[0].id, this.reviewForm.value).subscribe(
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
		this._collectionService.getParticipants(this.classId, query).subscribe(
			(response: any) => {
				this.allParticipants = response;
				for (const responseObj of response) {
					if (this.calendarId && this.calendarId === responseObj.calendarId) {
						this.participants.push(responseObj);
					}
					if (this.calendarId === undefined && responseObj.id === this.userId) {
						// current user is a participant of this class
						isCurrentUserParticipant = true;
						currentUserParticipatingCalendar = responseObj.calendarId;
					}
					if (responseObj.id === this.userId) {
						this.loggedInUser = responseObj;
					}
				}
				if (isCurrentUserParticipant) {
					this.router.navigate(['class', this.classId, 'calendar', currentUserParticipatingCalendar]);
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
		return comment.peer && comment.peer.length > 0 && comment.peer[0].id === this.userId;
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
		this.class.calendars.forEach(calendar => {
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
		this.class.calendars.forEach(calendar => {
			const cohortStartDate = moment(calendar.startDate);
			const cohortEndDate = moment(calendar.endDate);
			const currentMoment = moment();
			if (cohortStartDate.diff(currentMoment, 'seconds') > 0) {
				result = true;
			}
		});
		return result;
	}

	public shareOnFb() {
		FB.ui({
			method: 'share_open_graph',
			action_type: 'og.shares',
			action_properties: JSON.stringify({
				object: {
					'og:url': environment.clientUrl + this.router.url, // your url to share
					'og:title': this.class.title,
					'og:site_name': 'Peerbuds',
					'og:description': this.class.description,
					'og:image': environment.apiUrl + this.class.imageUrls[0],
					'og:image:width': '250',
					'og:image:height': '257'
				}
			})
		}, function (response) {
			console.log('response is ', response);
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
	
	public openSignup(returnTo) {
		this.dialogsService.openSignup(returnTo).subscribe();
	}

	public openProfilePage(peerId) {
		this.router.navigate(['profile', peerId]);
	}

	public openInviteFriendsDialog() {
		this.dialogsService.inviteFriends(this.class);
	}
	/**
	 * joinLiveSession
	 */
	public joinLiveSession(content: any) {
		const data = {
			roomName: content.id + this.calendarId,
			teacher: this.class.owners[0],
			content: content,
			participants: this.class.participants
		};
		this.dialogsService.startLiveSession(data).subscribe(result => {
		});
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

	public isCancelable() {
		if (this.currentCalendar) {
			return moment(this.currentCalendar.endDate) > this.today;
		}
	}

	public openGroupChat() {
		if (this.class.rooms && this.class.rooms.length > 0) {
			this.router.navigate(['console', 'inbox', this.class.rooms[0].id]);
		} else {
			this.snackBar.open('Looks like you have not been subscribed to this class\'s group chat. If this is unintentional, contact support.', 'Close', {
				duration: 5000
			});
		}
	}

	public openAssessmentDialog() {
		this.dialogsService.studentAssessmentDialog(
			{
				'participants': this.participants,
				'assessment_models': this.class.assessment_models,
				'academicGyan': this.class.academicGyan,
				'nonAcademicGyan': this.class.nonAcademicGyan
			}
		).subscribe(dialogSelection => {
			let assessmentEngagementRule, assessmentCommitmentRule;
			if (dialogSelection) {
				this.class.assessment_models[0].assessment_na_rules.forEach(assessment_na_rule => {
					if (assessment_na_rule.value === 'engagement') {
						assessmentEngagementRule = assessment_na_rule;
					} else if (assessment_na_rule.value === 'commitment') {
						assessmentCommitmentRule = assessment_na_rule;
					}
				});
				const assessmentArray: Array<AssessmentResult> = [];
				dialogSelection.participants.forEach(participant => {
					if (participant.rule_obj && participant.rule_obj.id) {
						assessmentArray.push({
							assesserId: this.userId,
							assesseeId: participant.id,
							calendarId: this.calendarId,
							assessmentRuleId: participant.rule_obj.id,
							assessmentEngagementRuleId: assessmentEngagementRule.id,
							assessmentCommitmentRuleId: assessmentCommitmentRule.id,
							assessmentEngagementResult: participant.engagement_result,
							assessmentCommitmentResult: participant.commitment_result
						});
					}
				});
				this._assessmentService.submitAssessment(assessmentArray).subscribe(result => {
					console.log(result);
					this.snackBar.open('Your assessment has been submitted. Students will be informed over email.', 'Ok', { duration: 5000 });
					this._authenticationService.isLoginSubject.next(true);
				});
			}
		});
	}

	public onClassRefresh(event) {
		if (event) {
			this.getRecommendations();
		}
	}

	public getPredictedGyanEarn(collection) {
		const participantCount = collection.participants ? collection.participants.length : 0;
		return (collection.academicGyan + collection.nonAcademicGyan) * participantCount;
	}

	public openMessageDialog(peer) {
		this.dialogsService.messageParticipant(peer).subscribe(result => {
			// console.log(result);
		});
	}

	public addToEthereum() {
		this._collectionService.addToEthereum(this.classId)
			.subscribe(res => {
				this.initializeClass();
			}, err => {
				this.snackBar.open('Could not add to one0x Blockchain. Try again later.', 'Ok', { duration: 5000 });
			});
	}

	private sortAssessmentRules() {
		if (this.class.assessment_models && this.class.assessment_models.length > 0) {
			const assessmentRulesUnsorted = <Array<any>>this.class.assessment_models[0].assessment_rules;
			this.assessmentRules = assessmentRulesUnsorted.sort((a, b) => {
				if (a.value > b.value) {
					return 1;
				} else if (a.value === b.value) {
					return 0;
				} else {
					return -1;
				}
			});
		}
	}

	private getCertificatetemplate() {
		this.certificateService.getCertificateTemplate(this.classId).subscribe((res: any) => {
			if (res !== undefined && res !== null) {
				this.certificateHTML = res.certificateHTML;
			}
			this.loadingCertificate = false;
		});
	}

	public getGyanForRule(gyanPercent, totalGyan) {
		return Math.floor((gyanPercent / 100) * totalGyan);
	}

}

interface AssessmentResult {
	calendarId: string;
	assesserId: string;
	assesseeId: string;
	assessmentRuleId: string;
	assessmentEngagementRuleId: string;
	assessmentCommitmentRuleId: string;
	assessmentEngagementResult: number;
	assessmentCommitmentResult: number;
}
