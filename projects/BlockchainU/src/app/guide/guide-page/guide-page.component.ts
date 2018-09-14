import { Component, OnInit, ChangeDetectionStrategy, ViewContainerRef, OnDestroy, ViewChildren, ElementRef, QueryList } from '@angular/core';
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
import { Subject } from 'rxjs';
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
import { SocketService } from '../../_services/socket/socket.service';
import { AssessmentService } from '../../_services/assessment/assessment.service';
import { UcWordsPipe } from 'ngx-pipes';
import { CertificateService } from '../../_services/certificate/certificate.service';
import { ProfileService } from '../../_services/profile/profile.service';
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
	selector: 'app-guide-page',
	templateUrl: './guide-page.component.html',
	styleUrls: ['./guide-page.component.scss'],
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
export class GuidePageComponent implements OnInit, OnDestroy {

	public guideId: string;
	public envVariable;
	public userId;
	public userType: string;
	public totalDuration: string;
	public userRating: number;
	public newUserRating: number;
	public liveCohort;
	public isViewTimeHidden: boolean;


	public busyDiscussion: boolean;
	public busyReview: boolean;
	public busyReply: boolean;
	public initialLoad: boolean;
	public isReadonly: boolean;
	public noOfReviews: number;
	private initialised: boolean;
	public hasBookmarked: boolean;
	public defaultProfileUrl: string;
	public noWrapSlides: boolean;
	public peerHasSubmission: boolean;
	public isRatingReceived: boolean;
	public maxLength: number;
	public bookmarking: boolean;
	public recommendations: any;
	private today: any;
	public checkingEthereum: boolean;
	public isOnEthereum: boolean;
	public view: string;
	public dateClicked: boolean;
	public viewDate: Date;
	refresh: Subject<any>;
	events: CalendarEvent[];
	activeDayIsOpen: boolean;
	public loadingSimilarGuides: boolean;
	public loadingComments: boolean;
	public loadingParticipants: boolean;
	public loadingGuide: boolean;
	public loadingReviews: boolean;
	public accountApproved: string;
	public inviteLink: string;

	public loggedInUser;
	public bookmark;
	public replyingToCommentId: string;
	public guide: any;
	public chatForm: FormGroup;
	public modalContent: any;
	public topicFix: any;
	public messagingParticipant: any;
	public allItenaries: Array<any>;
	public reviews: Array<any>;
	public contentHasSubmission: any;
	public participants: Array<any>;
	public allParticipants: Array<any>;
	public editReviewForm: FormGroup;
	public editCommentForm: FormGroup;
	public editReplyForm: FormGroup;
	public replyForm: FormGroup;
	public reviewForm: FormGroup;
	public result;
	public lat;
	public lng;
	public mainLocation;
	public comments: Array<any>;
	// Calendar Start
	public clickedDate;
	public clickedCohort;
	public clickedCohortId;
	public clickedCohortStartDate;
	public clickedCohortEndDate;
	public eventsForTheDay: any;
	public toOpenDialogName;

	public objectKeys = Object.keys;


	public activityMapping:
		{ [k: string]: string } = { '=0': 'No activity', '=1': 'One activity', 'other': '# activities' };
	public hourMapping:
		{ [k: string]: string } = { '=0': 'Less than an hour of learning', '=1': 'One hour of learning', 'other': '# hours of learning' };
	public projectMapping:
		{ [k: string]: string } = { '=0': 'No projects', '=1': 'One project', 'other': '# projects' };
	public inPersonSessionMapping:
		{ [k: string]: string } = { '=0': 'No in-person activity', '=1': 'One in-person activity', 'other': '# in-person activities' };
	public cohortMapping:
		{ [k: string]: string } = { '=0': 'No cohort', '=1': 'One cohort', 'other': '# cohorts' };
	public dayMapping:
		{ [k: string]: string } = { '=0': 'Less than a day', '=1': 'One day', 'other': '# days' };
	public discussionMapping:
		{ [k: string]: string } = { '=0': 'No Comments', '=1': 'One comment', 'other': '# comments' };

	public carouselImages: Array<string>;
	public carouselBanner: any;
	public startedView;
	public previewAs: string;

	certificateHTML: string;
	loadingCertificate: boolean;
	public assessmentRules: Array<any>;
	public contactUsForm: FormGroup;
	@ViewChildren('certificateDomHTML') certificateDomHTML: QueryList<any>;

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
		private _profileService: ProfileService
		// private location: Location
	) {
		this.envVariable = environment;
	}

	ngOnInit() {
		this._authenticationService.isLoginSubject.subscribe(res => {
			console.log('Initializing Page');
			this.initializePage();
		});
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
			});
		}
	}

	initializePage() {
		this.newUserRating = 0;
		this.isViewTimeHidden = true;
		this.busyDiscussion = false;
		this.busyReview = false;
		this.busyReply = false;
		this.initialLoad = true;
		this.isReadonly = true;
		this.noOfReviews = 3;
		this.initialised = false;
		this.hasBookmarked = false;
		this.defaultProfileUrl = '/assets/images/avatar.png';
		this.noWrapSlides = true;
		this.peerHasSubmission = false;
		this.isRatingReceived = false;
		this.maxLength = 140;
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
		this.loadingSimilarGuides = true;
		this.loadingComments = true;
		this.loadingParticipants = true;
		this.loadingGuide = true;
		this.loadingReviews = true;
		this.accountApproved = 'false';
		this.inviteLink = '';
		this.activatedRoute.params.subscribe(params => {
			if (this.initialised && (this.guideId !== params['collectionId'])) {
				location.reload();
			}
			this.guideId = params['collectionId'];
			this.toOpenDialogName = params['dialogName'];
		});
		this.activatedRoute.queryParams.subscribe(params => {
			if (params['previewAs']) {
				this.previewAs = params['previewAs'];
				console.log('Previewing as ' + this.previewAs);
			}
		});
		this.userId = this._cookieUtilsService.getValue('userId');
		this.accountApproved = this._cookieUtilsService.getValue('accountApproved');

		this.initialised = true;
		this.initializeGuide();
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
		const sortedCalendar = this.sort(this.guide.calendars, 'startDate', 'endDate');

		this.dialogsService
			.editCalendar({ id: this.guideId, type: this.guide.type, name: this.guide.title },
				this.guide.contents, this.guide.calendars, this.allItenaries, this.allParticipants,
				this.events, this.userId, sortedCalendar[sortedCalendar.length - 1].startDate,
				sortedCalendar[sortedCalendar.length - 1].endDate)
			.subscribe(res => {
				if (res) {
					this.result = res;
					if (this.result.calendarsSaved === 'calendarsSaved') {
						this.initializeGuide();
					}
					if (this.result.cohortDeleted) {
						this.refreshView();
					}
				}
			});
	}

	private initializeUserType() {
		if (this.guide) {
			if (this.previewAs) {
				this.userType = this.previewAs;
			} else {
				for (const owner of this.guide.owners) {
					if (owner.id === this.userId) {
						console.log('ownerId:' + owner.id + ' userId:' + this.userId);

						this.userType = 'teacher';
						// this.getCertificatetemplate();
						this.sortAssessmentRules();
						break;
					}
				}
				if (!this.userType) {
					for (const participant of this.guide.participants) {
						if (participant.id === this.userId) {
							this.userType = 'participant';
							break;
						}
					}
				}
				if (!this.userType) {
					this.userType = 'public';
				}
			}
			this.loadingGuide = false;
		}
	}

	private initializeGuide() {
		this.loadingCertificate = true;
		this.allParticipants = [];
		this.allItenaries = [];
		const query = {
			'include': [
				'topics',
				'views',
				{ 'participants': [{ 'profiles': ['work'] }] },
				{ 'owners': [{ 'profiles': ['work'] }] },
				'rooms'
			]
		};

		if (this.guideId) {
			this._collectionService.getCollectionEthereumInfo(this.guideId, {})
				.subscribe(res => {
					this.checkingEthereum = false;
					if (res && res[6] && res[6] !== '0') {
						this.isOnEthereum = true;
					}
				});
			this._collectionService.getCollectionDetail(this.guideId, query)
				.subscribe(res => {
					console.log(res);
					this.guide = res;
					this.inviteLink = environment.clientUrl + '/guide/' + this.guide.id;
					this.setTags();
					fbq('track', 'ContentView', {
						currency: 'USD',
						value: 0.0,
						content_type: 'product',
						content_ids: [this.guideId]
					});
				},
					err => console.log('error'),
					() => {
						this.initializeUserType();
						this.fixTopics();
						this.getReviews();
						this.getRecommendations();
						this.getParticipants();
						this.getDiscussions();
						this.getBookmarks();
						this.setUpCarousel();
						if (this.toOpenDialogName !== undefined && this.toOpenDialogName === 'paymentSuccess') {
							const snackBarRef = this.snackBar.open('Your payment was successful. Happy learning!', 'Okay', { duration: 5000 });
							snackBarRef.onAction().subscribe();
							this.router.navigate(['guide', this.guideId]);
						}
						this.recordStartView();
					});
		} else {
			console.log('NO COLLECTION');
		}
	}

	public createGuestContacts() {
		console.log('Submitting request');

		const first_name = this.contactUsForm.controls['first_name'].value;
		const email = this.contactUsForm.controls['email'].value;
		const subject = 'Guide: ' + this.guide.title;
		const message = this.contactUsForm.controls['message'].value + ' Phone: ' + this.contactUsForm.controls['phone'].value;
		this._authenticationService.createGuestContacts(first_name, '', email, subject, message)
			.subscribe(res => {
				fbq('track', 'Lead', {
					currency: 'USD',
					value: 1.0,
					content_name: this.guide.title,
					content_category: this.guide.type
				});
				this.contactUsForm.reset();
				this.snackBar.open('Thanks for your interest we will get back to you shortly', 'Close', { duration: 3000 });
			}, err => {
				this.snackBar.open('Error in sending mail', 'Close', { duration: 3000 });
			});
	}

	private setTags() {
		this.titleService.setTitle(this.ucwords.transform(this.guide.title));
		this.metaService.updateTag({
			property: 'og:title',
			content: this.guide.title
		});
		this.metaService.updateTag({
			property: 'og:description',
			content: this.guide.description
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'theblockchainu.com'
		});
		if (this.guide.imageUrls) {
			this.metaService.updateTag({
				property: 'og:image',
				content: environment.apiUrl + this.guide.imageUrls[0]
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
			content: this.guide.price
		});
		this.metaService.addTag({
			property: 'product:price:currency',
			content: this.guide.currency
		});
		this.metaService.addTag({
			property: 'product:retailer_item_id',
			content: this.guide.id
		});
	}

	private setUpCarousel() {
		if (this.guide.imageUrls && this.guide.imageUrls.length > 0) {
			this.carouselImages = this.guide.imageUrls.map(url => environment.apiUrl + url);
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
			collection: this.guide,
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
		const query = {
			'include': [
				{
					'peer': ['profiles']
				}],
			'where': { 'collectionId': this.guideId }
		};
		this._collectionService.getReviews(this.guide.owners[0].id, query, (err, response) => {
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
		this._collectionService.getBookmarks(this.guideId, query, (err, response) => {
			if (err) {
				console.log(err);
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
		this._collectionService.getComments(this.guideId, query, (err, response) => {
			if (err) {
				console.log(err);
			} else {
				this.comments = response;
				this.loadingComments = false;
			}
		});
	}

	private fixTopics() {
		this.topicFix = _.uniqBy(this.guide.topics, 'id');
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
			collectionId: this.guideId
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

		this._profileService.getPeerData(this.userId, filter).subscribe(res => {
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
		});
	}

	gotoEdit() {
		this.router.navigate(['guide', this.guideId, 'edit', this.guide.stage ? this.guide.stage : '1']);
	}

	/**
	 * changeDates
	 */
	public changeDates() {
		this.dialogsService.selectDateDialog(this.allItenaries, 'chooseDate', this.allParticipants, this.userType, this.guide.type, this.guide.maxSpots, this.accountApproved, this.userId)
			.subscribe((result: any) => {
				if (result) {
					this.router.navigate(['guide', this.guideId, 'calendar', result]);
				}
			});
	}

	/**
	 * cancelGuide
	 */
	public cancelGuide() {
		this.dialogsService.openCancelCollection(this.guide).subscribe((response: any) => {
			if (response) {
				this.initializePage();
			}
		});
	}

	/**
	 * dropoutGuide
	 */
	public dropOutGuide() {
		this.dialogsService.openExitCollection(this.guideId, this.userId).subscribe((response: any) => {
			if (response) {
				this.router.navigate(['guide', this.guideId]);
			}
		});
	}

	/**
	 * deleteGuide
	 */
	public deleteGuide() {
		this.dialogsService.openDeleteCollection(this.guide).subscribe((response: any) => {
			if (response) {
				this.router.navigate(['/console/teaching/guides']);
			}
		});
	}



	/**
	 * postComment
	 */
	public postComment() {
		if (this.userId) {
			this.busyDiscussion = true;
			this._collectionService.postComments(this.guideId, this.chatForm.value, (err, response) => {
				if (err) {
					console.log(err);
				} else {
					this.chatForm.reset();
					this.busyDiscussion = false;
					this.getDiscussions();
				}
			});
		} else {
			this.dialogsService.openLogin().subscribe(res => {
				if (res) {
					this.initializePage();
				}
			});
		}

	}

	/**
	 * saveBookmark
	 */
	public saveBookmark() {
		this.bookmarking = true;
		if (!this.hasBookmarked) {
			this._collectionService.saveBookmark(this.guideId, (err, response) => {
				if (err) {
					console.log(err);
				} else {
					// FB Event Trigger
					fbq('track', 'AddToWishlist', {
						currency: 'USD',
						value: 0.0,
						content_ids: [this.guideId],
						content_name: this.guide.title,
						content_category: this.guide.type,
						content_type: 'product'
					});
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


	public getDirections(content) {
		// TODO: get directions to this content location
	}


	public getContentCount(type: string) {
		let count = 0;
		for (const content of this.guide.contents) {
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
			this.guideId,
			this.userType).subscribe();
	}

	viewAllParticipants() {
		this.dialogsService.viewParticipantstDialog(this.allParticipants, this.guideId).subscribe();
	}


	/**
	 * getRecommendations
	 */
	public getRecommendations() {
		this.loadingSimilarGuides = true;
		const query = {
			'include': [
				{
					'relation': 'collections', 'scope': {
						'include':
							[{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'calendars', 'participants',
							{ 'contents': 'locations' }], 'where': { 'type': 'guide' }
					}
				}
			]
		};
		this._topicService.getTopics(query).subscribe(
			(response: any) => {
				for (const responseObj of response) {
					responseObj.collections.forEach(collection => {
						if (collection.id !== this.guideId) {
							let guideLocation = 'Unknown location';
							let lat = 37.5293864;
							let lng = -122.008471;
							if (collection.status === 'active') {
								if (collection.contents) {
									collection.contents.forEach(content => {
										if (content.locations && content.locations.length > 0
											&& content.locations[0].city !== undefined
											&& content.locations[0].city.length > 0
											&& content.locations[0].map_lat !== undefined
											&& content.locations[0].map_lat.length > 0) {
											guideLocation = content.locations[0].city;
											lat = parseFloat(content.locations[0].map_lat);
											lng = parseFloat(content.locations[0].map_lng);
										}
									});
									collection.location = guideLocation;
									collection.lat = lat;
									collection.lng = lng;
								}
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
						}
					});
				}
				this.recommendations.collections = _.uniqBy(this.recommendations.collections, 'id');
				this.recommendations.collections = _.orderBy(this.recommendations.collections, ['createdAt'], ['desc']);
				this.recommendations.collections = _.chunk(this.recommendations.collections, 5)[0];
				this.loadingSimilarGuides = false;
			}, (err) => {
				console.log(err);
			}
		);
	}

	/**
	 * selectJoiningDates
	 */
	// public selectJoiningDates() {

	// 	this.dialogsService.selectDateDialog(this.allItenaries, 'chooseDate', this.allParticipants, this.userType, this.guide.type, this.guide.maxSpots, this.accountApproved, this.userId)
	// 		.subscribe((result: any) => {
	// 			if (result) {
	// 				if (this.userId) {
	// 					this.router.navigate(['review-pay', 'collection', this.guideId, result]);
	// 				} else {
	// 					// this.router.navigate(['sign-up']);
	// 					const returnTo = 'review-pay/collection/' + this.guideId + '/' + result;
	// 					this.openSignup(returnTo);
	// 				}
	// 			}
	// 		});
	// }

	public signUp() {
		this.router.navigate(['review-pay', 'collection', this.guideId]);
	}

	public openSignup(returnTo) {
		this.dialogsService.openSignup(returnTo).subscribe();
	}

	private extractTime(dateString: string) {
		const time = moment.utc(dateString).local().format('HH:mm:ss');
		return time;
	}

	public viewDetails(key) {
		this.router.navigate(['guide', this.guideId, 'calendar', key]);
	}

	public openEventDialog(calendarId, eventId) {
		this.router.navigate(['guide', this.guideId, 'calendar', calendarId, eventId]);
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
		this._collectionService.postReview(this.guide.owners[0].id, this.reviewForm.value).subscribe(
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
			'relInclude': 'calendarId',
			'include': ['profiles', 'reviewsAboutYou', 'ownedCollections']
		};
		this._collectionService.getParticipants(this.guideId, query).subscribe(
			(response: any) => {
				this.allParticipants = response;
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

	public hasLiveCohort() {
		let result = false;
		this.guide.calendars.forEach(calendar => {
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
		this.guide.calendars.forEach(calendar => {
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
					'og:title': this.guide.title,
					'og:site_name': 'The Blockchain University',
					'og:description': this.guide.description,
					'og:image': environment.apiUrl + this.guide.imageUrls[0],
					'og:image:width': '250',
					'og:image:height': '257'
				}
			})
		}, function (response) {
		});
	}

	public shareOnTwitter() {
		// TODO twitter sharing code
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

	public openProfilePage(peerId) {
		this.router.navigate(['profile', peerId]);
	}

	public openInviteFriendsDialog() {
		this.dialogsService.inviteFriends(this.guide);
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

	public openGroupChat() {
		if (this.guide.rooms && this.guide.rooms.length > 0) {
			this.router.navigate(['console', 'inbox', this.guide.rooms[0].id]);
		} else {
			this.snackBar.open('Looks like you have not been subscribed to this guide\'s group chat. If this is unintentional, contact support.', 'Close', {
				duration: 5000
			});
		}
	}

	public onGuideRefresh(event) {
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
		this._collectionService.addToEthereum(this.guideId)
			.subscribe(res => {
				this.initializeGuide();
			}, err => {
				this.snackBar.open('Could not add to one0x Blockchain. Try again later.', 'Ok', { duration: 5000 });
			});
	}

	private sortAssessmentRules() {
		if (this.guide.assessment_models && this.guide.assessment_models.length > 0) {
			const assessmentRulesUnsorted = <Array<any>>this.guide.assessment_models[0].assessment_rules;
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
	public getGyanForRule(gyanPercent, totalGyan) {
		return Math.floor((gyanPercent / 100) * totalGyan);
	}

	public addParticipant() {
		this.dialogsService.addParticipant(this.guideId).subscribe(res => {
			if (res) {
				this.initializePage();
			}
		});
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
