import { Component, OnInit, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Title, Meta } from '@angular/platform-browser';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { ContentService } from '../../_services/content/content.service';
import { CommentService } from '../../_services/comment/comment.service';

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
import { Subject } from 'rxjs';
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
import { UcWordsPipe } from 'ngx-pipes';
import { CertificateService } from '../../_services/certificate/certificate.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { Observable } from 'rxjs';
import { first, flatMap } from 'rxjs/operators';
import { Location } from '@angular/common';
declare var FB: any;
declare var fbq: any;

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
	public newUserRating: number;
	public liveCohort;
	public isViewTimeHidden: boolean;
	public busyDiscussion: boolean;
	public busyReview: boolean;
	public busyReply: boolean;
	public loggedInUser;
	public isReadonly: boolean;
	public noOfReviews: number;
	private initialised: boolean;
	public bookmark;
	public hasBookmarked: boolean;
	public replyingToCommentId: string;
	private certificateDomSubscription;
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
	public defaultProfileUrl: string;
	public noWrapSlides: boolean;
	public peerHasSubmission: boolean;
	public contentHasSubmission: any;
	public participants: Array<any>;
	public allParticipants: Array<any>;
	public isRatingReceived: boolean;
	public maxLength: number;
	public editReviewForm: FormGroup;
	public bookmarking: boolean;
	public editCommentForm: FormGroup;
	public editReplyForm: FormGroup;
	certificateHTML: string;
	loadingCertificate: boolean;
	public replyForm: FormGroup;
	public reviewForm: FormGroup;
	public recommendations: any;
	public result;
	public comments: Array<any>;
	today: any;
	public answeredDate;

	// Calendar Start
	public dateClicked: boolean;
	public clickedDate;
	public clickedCohort;
	public clickedCohortId;
	public clickedCohortStartDate;
	public clickedCohortEndDate;
	public eventsForTheDay: any;
	public toOpenDialogName;
	private allowedDialogNames = ['paymentSuccess', 'assessment'];
	public checkingEthereum: boolean;
	public isOnEthereum: boolean;
	public previewAs: string;
	public view: string;
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
	public viewDate: Date;
	refresh: Subject<any>;
	public events: any;
	public carouselImages: Array<string>;
	activeDayIsOpen: boolean;
	public loadingSimilarClasses: boolean;
	public loadingComments: boolean;
	public loadingParticipants: boolean;
	public loadingClass = true;
	public loadingReviews: boolean;
	public accountApproved: any;
	public carouselBanner: any;
	public startedView;
	public inviteLink: string;
	public assessmentRules: Array<any>;
	public contactUsForm: FormGroup;
	public isFollowing: boolean;
	@ViewChildren('certificateDomHTML') certificateDomHTML: QueryList<any>;

	objectKeys = Object.keys;

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
		private certificateService: CertificateService,
		private _profileService: ProfileService,
		private location: Location
	) {
		this.envVariable = environment;
	}

	ngOnInit() {
		// Subscribe to login listener and refresh page when user logs in.
		this._authenticationService.isLoginSubject.subscribe(res => {
			this.initializePage();
		});
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
			});
		}
	}

	initializePage() {

		// Close all existing dialogs
		this.dialogsService.closeAll();

		console.log('Initializing Page');
		this.initializeGlobalVariables();
		this.setValuesFromCookies();
		this.setValuesFromRouteParameters()
			.pipe(
				flatMap(res => {
					return this.initializeForms();
				}),
				flatMap(res => {
					return this.setContactFormValues(res);
				}),
				flatMap(res => {
					return this.fetchData();
				}),
				flatMap(res => {
					return this.processData(res);
				})
			)
			.subscribe(res => {
				this.initialised = true;
			});
	}

	private fetchData() {
		this.loadingCertificate = true;
		this.allParticipants = [];
		this.allItenaries = [];
		const query = {
			'include': [
				'topics',
				'calendars',
				'views',
				{
					'participants': [
						{ 'profiles': ['work'] }
					]
				},
				{ 'owners': [{ 'profiles': ['work'] }] },
				{
					'contents': [
						'locations',
						'schedules',
						{ 'questions': { 'answers': { 'peer': 'profiles' } } },
						{ 'rsvps': 'peer' },
						{ 'views': 'peer' },
						{
							'submissions': [
								{ 'upvotes': 'peer' },
								{ 'peer': 'profiles' }
							]
						}
					]
				},
				'rooms',
				'peersFollowing',
				{
					'assessment_models': [
						{ 'assessment_na_rules': { 'assessment_result': 'assessees' } },
						{ 'assessment_rules': { 'assessment_result': 'assessees' } }]
				}
			],
			'relInclude': 'calendarId',
			'where': {
				'or': [{ 'customUrl': this.classId }, { 'id': this.classId }]
			}
		};

		return this._collectionService.getAllCollections(query);
	}

	private initializeGlobalVariables() {
		this.newUserRating = 0;
		this.isViewTimeHidden = true;
		this.busyDiscussion = false;
		this.busyReview = false;
		this.busyReply = false;
		this.isReadonly = true;
		this.noOfReviews = 3;
		this.initialised = false;
		this.hasBookmarked = false;
		this.defaultProfileUrl = '/assets/images/avatar.png';
		this.noWrapSlides = true;
		this.peerHasSubmission = false;
		this.isRatingReceived = false;
		this.maxLength = 50000;
		this.bookmarking = false;
		this.recommendations = {
			collections: []
		};
		this.today = moment();
		this.checkingEthereum = true;
		this.isOnEthereum = false;
		this.view = 'month';
		this.dateClicked = false;
		this.viewDate = new Date();
		this.refresh = new Subject();
		this.events = [
		];
		this.activeDayIsOpen = true;
		this.loadingSimilarClasses = true;
		this.loadingComments = true;
		this.loadingParticipants = true;
		this.accountApproved = 'false';
		this.inviteLink = '';
		this.loadingClass = true;
		this.loadingReviews = true;
		this.accountApproved = 'false';
		this.inviteLink = '';
		this.isFollowing = false;
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

	private setValuesFromRouteParameters() {
		return this.activatedRoute.params.pipe(
			first(),
			flatMap(params => {
				/*if (this.initialised && (this.classId !== params['collectionId'] || this.calendarId !== params['calendarId'])) {
					console.log('**** RELOADING PAGE');
					location.reload();
				}*/
				this.classId = params['collectionId'];
				this.calendarId = params['calendarId'];
				this.toOpenDialogName = params['dialogName'];
				return this.activatedRoute.queryParams;
			}),
			flatMap(params => {
				if (params['previewAs']) {
					this.previewAs = params['previewAs'];
				}
				if (params['referredBy']) {
					this._collectionService.saveRefferedBY(params['referredBy']);
				} else {
					this._cookieUtilsService.deleteValue('referrerId');
				}
				return new Observable(obs => {
					obs.next();
				});
			}));
	}

	private setValuesFromCookies() {
		this.userId = this._cookieUtilsService.getValue('userId');
		this.accountApproved = this._cookieUtilsService.getValue('accountApproved');
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

	/**
	 * Open Dialog to manage cohorts
	 */
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
						this.initializePage();
					}
					if (this.result.cohortDeleted) {
						this.refreshView();
					}
				}
			});
	}

	/**
	 * Set the current user's type
	 */
	private initializeUserType() {
		if (this.class) {
			if (this.previewAs) {
				this.userType = this.previewAs;
			} else {
				for (const owner of this.class.owners) {
					if (owner.id === this.userId) {
						this.userType = 'teacher';
						this.sortAssessmentRules();
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
						if (this.class.customUrl) {
							this.router.navigate(['class', this.class.customUrl]);
						} else {
							this.router.navigate(['class', this.class.id]);
						}
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
		this.allItenaries = [];
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

	private processData(res: any) {
		if (res && res.length > 0) {
			console.log('PROCESSING DATA');
			this.class = res[0];
			this.classId = this.class.id;
			this.inviteLink = environment.clientUrl + '/class/' + this.class.id;
			this.setTags();
			this.setCurrentCalendar();
			try {
				if (fbq && fbq !== undefined) {
					fbq('track', 'ViewContent', {
						currency: 'USD',
						value: 0.0,
						content_type: 'product',
						content_ids: [this.classId]
					});
				}
			} catch (e) {
				console.log(e);
			}
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

				if (contentObj.questions && contentObj.questions.length > 0) {
					contentObj.questions.forEach(question => {
						if (question.answers) {
							question.answers.forEach(answer => {
								if (answer.peer && this.userId === answer.peer[0].id) {
									contentObj['hasAnswered'] = true;
									contentObj['answeredDate'] = moment(answer.createdAt).format('Do MMM, YYYY');
								}
							});
						}
					});
				}
			});
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
			if (this.class && this.class.owners && this.class.owners.length > 0) {
				this.getEthereumInfo();
				this.initializeUserType();
				this.calculateTotalHours();
				this.getCertificatetemplate();
				this.fixTopics();
				this.getReviews();
				this.getRecommendations();
				this.getParticipants();
				this.getDiscussions();
				this.getBookmarks();
				this.setUpCarousel();
				this.checkIfFollowing();
				if (this.toOpenDialogName !== undefined && !_.find(this.allowedDialogNames, name => name === this.toOpenDialogName)) {
					this.itenaryArray.forEach(itinerary => {
						itinerary.contents.forEach(content => {
							if (content.id === this.toOpenDialogName) {
								this.openDialog(content, itinerary.startDate, itinerary.endDate);
								return;
							}
						});
					});
				} else if (this.toOpenDialogName !== undefined && _.find(this.allowedDialogNames, name => name === this.toOpenDialogName)) {
					this.openCustomDialog(this.toOpenDialogName);
				}
				this.recordStartView();
			} else {
				this.snackBar.open('This online course has either been deleted or flagged.', 'OK', { duration: 5000 });
				this.router.navigate(['home', 'classes']);
			}
		} else {
			this.loadingClass = false;
		}
		return new Observable(obs => {
			obs.next();
		});
	}

	private openCustomDialog(dialogName) {
		switch (dialogName) {
			case 'paymentSuccess':
				this.location.go('/class/' + this.classId + '/calendar/' + this.calendarId);
				this.snackBar.open('Your payment was successful. Happy learning!', 'Okay', { duration: 5000 });
				break;
			case 'assessment':
				this.openAssessmentDialog();
		}
	}

	private getEthereumInfo() {
		this._collectionService.getCollectionEthereumInfo(this.classId, {})
			.subscribe(res => {
				this.checkingEthereum = false;
				if (res && res[6] && res[6] !== '0') {
					this.isOnEthereum = true;
				}
			});
	}

	private checkIfFollowing() {
		if (this.class.peersFollowing && this.class.peersFollowing.length > 0) {
			this.class.peersFollowing.some(peer => {
				console.log(peer);
				if (peer.id === this.userId) {
					this.isFollowing = true;
					console.log('isFollowing');
					return true;
				}
			});
		}
	}

	public createGuestContacts() {
		console.log('Submitting request');

		const first_name = this.contactUsForm.controls['first_name'].value;
		const email = this.contactUsForm.controls['email'].value;
		const subject = 'Online Course: ' + this.class.title;
		const message = '<b>' + this.contactUsForm.controls['message'].value + '</b><br><br>Phone: ' + this.contactUsForm.controls['phone'].value
			+ '<br><br><div style="font-size: 11px;">Received from page: ' + environment.clientUrl + this.router.url + '</div>';
		this._authenticationService.createGuestContacts(first_name, '', email, subject, message)
			.subscribe(res => {
				try {
					if (fbq && fbq !== undefined) {
						fbq('track', 'Lead', {
							currency: 'USD',
							value: 1.0,
							content_name: this.class.title,
							content_category: this.class.type
						});
					}
				} catch (e) {
					console.log(e);
				}
				this.contactUsForm.reset();
				this.snackBar.open('Thanks for your interest we will get back to you shortly', 'Close', { duration: 5000 });
			}, err => {
				this.snackBar.open('Error in sending mail', 'Close', { duration: 3000 });
			});
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
			content: 'theblockchainu.com'
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
		this.metaService.addTag({
			property: 'product:brand',
			content: 'The Blockchain U'
		});
		this.metaService.addTag({
			property: 'product:availability',
			content: 'in stock'
		});
		this.metaService.addTag({
			property: 'product:condition',
			content: 'new'
		});
		this.metaService.addTag({
			property: 'product:price:amount',
			content: this.class.price
		});
		this.metaService.addTag({
			property: 'product:price:currency',
			content: this.class.currency
		});
		this.metaService.addTag({
			property: 'product:retailer_item_id',
			content: this.class.id
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
				this.hasBookmarked = false;
			} else {
				this.hasBookmarked = false;
				response.forEach(bookmark => {
					if (bookmark.peer[0].id === this.userId) {
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

		const filter = {
			'include': [{ 'profiles': ['phone_numbers'] }]
		};

		this.contactUsForm = this._fb.group(
			{
				first_name: ['', Validators.required],
				email: ['', Validators.required],
				subject: [''],
				message: ['', Validators.required],
				phone: ['']
			}
		);

		return this._profileService.getPeerData(this.userId, filter);
	}

	private setContactFormValues(res) {
		// If user exists, setup his contact form
		if (res && res.profiles && res.profiles.length > 0) {

			const userPhone = res.profiles[0].phone_numbers && res.profiles[0].phone_numbers.length > 0 ? '+'
				+ res.profiles[0].phone_numbers[0].country_code + res.profiles[0].phone_numbers[0].subscriber_number : '';

			this.contactUsForm = this._fb.group(
				{
					first_name: [res.profiles[0].first_name, Validators.required],
					email: [res.email, Validators.required],
					subject: [''],
					message: ['', Validators.required],
					phone: [userPhone]
				}
			);
		} else {
			this.contactUsForm = this._fb.group(
				{
					first_name: ['', Validators.required],
					email: ['', Validators.required],
					subject: [''],
					message: ['', Validators.required],
					phone: ['']
				}
			);
		}
		return new Observable(obs => {
			obs.next();
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
	 * Open Dialog to select a particular cohort
	 */
	public changeDates() {
		this.dialogsService.selectDateDialog(this.allItenaries, 'chooseDate', this.allParticipants, this.userType, this.class.type, this.class.maxSpots, this.accountApproved, this.userId)
			.subscribe((result: any) => {
				if (result) {
					this.router.navigate(['class', this.classId, 'calendar', result]);
				}
			});
	}

	/**
	 * Open Dialog to select a particular cohort and then open its assessment dialog.
	 */
	public changeDatesForAssessment() {
		this.dialogsService.selectDateDialog(this.allItenaries, 'chooseDate', this.allParticipants, this.userType, this.class.type, this.class.maxSpots, this.accountApproved, this.userId)
			.subscribe((result: any) => {
				if (result) {
					this.router.navigate(['class', this.classId, 'calendar', result, 'assessment']);
				}
			});
	}

	/**
	 * cancelClass
	 */
	public cancelClass() {
		this.dialogsService.openCancelCollection(this.class).subscribe((response: any) => {
			if (response) {
				this.initializePage();
			}
		});
	}

	/**
	 * dropoutClass
	 */
	public dropOutClass() {
		this.dialogsService.openExitCollection(this.classId, this.userId, this.class.type).subscribe((response: any) => {
			if (response) {
				this.router.navigate(['class', this.classId]);
			}
		});
	}

	public cancelCohort() {
		this.dialogsService.openDeleteCohort(this.calendarId).subscribe((res: any) => {
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
		this.dialogsService.openDeleteCollection(this.class).subscribe((response: any) => {
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
		if (this.userId && this.userId.length > 5) {
			this.bookmarking = true;
			if (!this.hasBookmarked) {
				this._collectionService.saveBookmark(this.classId, (err, response) => {
					if (err) {
						console.log(err);
					} else {
						// FB Event Trigger
						try {
							if (fbq && fbq !== undefined) {
								fbq('track', 'AddToWishlist', {
									currency: 'USD',
									value: 0.0,
									content_ids: [this.classId],
									content_name: this.class.title,
									content_category: this.class.type,
									content_type: 'product'
								});
							}
						} catch (e) {
							console.log(e);
						}
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
		} else {
			this.dialogsService.openSignup('/class/' + this.class.id);
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
		this.dialogsService.viewParticipantstDialog(
			this.participants,
			this.classId,
			this.userType).subscribe();
	}

	viewAllParticipants() {
		this.dialogsService.viewParticipantstDialog(this.allParticipants, this.classId, this.userType).subscribe();
	}

	/**
	 * openDialog
	 content:any   */
	public openDialog(content: any, startDate, endDate) {
		this.modalContent = content;
		switch (content.type) {
			case 'online':
				this.dialogsService.onlineContentDialog(content, startDate, endDate, this.userType, this.class, this.calendarId);
				break;
			case 'quiz':
				this.dialogsService.quizContentDialog(content, startDate, endDate, this.userType, this.class, this.calendarId, this.participants)
					.subscribe(res => {
						if (res) {
							content.hasAnswered = true;
							content.answeredDate = moment().format('Do MMM, YYYY');
						}
					});
				break;
			case 'video':
				this.dialogsService.videoContentDialog(content, startDate, endDate, this.userType, this.class, this.calendarId);
				break;
			case 'project':
				this.dialogsService.projectContentDialog(content, startDate, endDate, this.userType, this.peerHasSubmission,
					this.class, this.calendarId).subscribe(res => {
						if (res) {
							this.initializePage();
						}
					});
				break;
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
			content.timetoSession = 'Ended ' + endMoment.fromNow();
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
			(response: any) => {
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
			.subscribe((result: any) => {
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
			(result: any) => {
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
			(result: any) => {
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
			(result: any) => {
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
			(result: any) => {
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
			'relInclude': ['calendarId', 'referrerId'],
			'include': ['profiles', 'reviewsAboutYou', 'ownedCollections', 'certificates']
		};
		let isCurrentUserParticipant = false;
		let currentUserParticipatingCalendar = '';
		this._collectionService.getParticipants(this.classId, query).subscribe(
			(response: any) => {
				this.participants = [];
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
				if (isCurrentUserParticipant && currentUserParticipatingCalendar) {
					this.router.navigate(['class', this.classId, 'calendar', currentUserParticipatingCalendar]);
				}
				this.loadingParticipants = false;
				return new Observable(obs => {
					obs.next();
				});
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
					'og:site_name': 'The Blockchain University',
					'og:description': this.class.description,
					'og:image': environment.apiUrl + this.class.imageUrls[0],
					'og:image:width': '500',
					'og:image:height': '700'
				}
			})
		}, function (response) {
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
						const thisViewTime = endTime.diff(startTime);
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
		this.dialogsService.startLiveSession(data).subscribe((result: any) => {
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
				'collection': this.class,
				'participants': this.participants,
				'assessment_models': this.class.assessment_models,
				'academicGyan': this.class.academicGyan,
				'nonAcademicGyan': this.class.nonAcademicGyan,
				'quizContents': this.filterQuizContents(this.itenaryArray)
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
				this._assessmentService.submitAssessment(assessmentArray).subscribe((result: any) => {
					this.initializePage();
					this.snackBar.open('Your assessment has been submitted. Students will be informed over email.', 'Ok', { duration: 5000 });
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
		this.dialogsService.messageParticipant(peer).subscribe((result: any) => {
		});
	}

	public addToEthereum() {
		this._collectionService.addToEthereum(this.classId)
			.subscribe(res => {
				this.initializePage();
			}, err => {
				this.snackBar.open('Could not add to one0x Blockchain. Try again later.', 'Ok', { duration: 5000 });
			});
	}

	private sortAssessmentRules() {
		if (this.class.assessment_models && this.class.assessment_models.length > 0 && this.class.assessment_models[0].assessment_rules) {
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
		try {
			this.certificateService.getCertificateTemplate(this.classId).subscribe((res: any) => {
				if (res !== undefined && res !== null) {
					this.certificateHTML = res.certificateHTML;
					this.certificateDomSubscription = this.certificateDomHTML.changes.subscribe(elem => {
						if (elem['first']) {
							const image = elem['first'].nativeElement.children[0].children[0].children[1].children[0];
							image.src = '/assets/images/theblockchainu-qr.png';
						}
					});
				}
				this.loadingCertificate = false;
			});
		} catch (e) {
			console.log(e);
		}
	}

	public getGyanForRule(gyanPercent, totalGyan) {
		return Math.floor((gyanPercent / 100) * totalGyan);
	}

	public addParticipant() {
		this.dialogsService.addParticipant(this.classId, this.calendarId).subscribe(res => {
			if (res) {
				this.initializePage();
			}
		});
	}

	public openShareDialog() {
		this.dialogsService.shareCollection(this.class.type, this.class.id, this.class.title,
			this.class.description, this.class.headline, environment.apiUrl + this.class.imageUrls[0]
			, this.calendarId, this.userType === 'teacher');
	}

	public followCollectionToggle() {
		if (this.userId && this.userId.length > 5) {
			if (!this.isFollowing) {
				this._profileService.followCollection(this.userId, this.classId).subscribe(res => {
					console.log('added');
					console.log(res);
					this.isFollowing = true;
					this.snackBar.open('Course Subscribed', 'close', { duration: 3000 });
				}, (err) => {
					console.log(err);
				});
			} else {
				this._profileService.unfollowCollection(this.userId, this.classId).subscribe(res => {
					console.log('deleted');
					console.log(res);
					this.isFollowing = false;
					this.snackBar.open('Course unsubscribed', 'close', { duration: 3000 });
				}, (err) => {
					console.log(err);
				});
			}
		} else {
			this.dialogsService.openSignup('/class/' + this.class.id);
		}
	}

	private filterQuizContents(itineraryDaysArray) {
		const quizContents = [];
		itineraryDaysArray.forEach(itineraryDay => {
			itineraryDay.contents.forEach(content => {
				if (content.type === 'quiz') {
					quizContents.push(content);
				}
			});
		});
		return quizContents;
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
