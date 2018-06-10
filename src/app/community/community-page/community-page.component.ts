import {
	Component, OnInit, ChangeDetectionStrategy, ViewContainerRef, AfterViewChecked,
	ChangeDetectorRef
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import { MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar } from '@angular/material';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { CommentService } from '../../_services/comment/comment.service';
import { ViewParticipantsComponent } from './view-participants/view-participants.component';
import { CommunityService } from '../../_services/community/community.service';
import { QuestionService } from '../../_services/question/question.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SearchService } from '../../_services/search/search.service';
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
import { Subject } from 'rxjs/Subject';
import { CalendarEvent, CalendarDateFormatter, CalendarUtils } from 'angular-calendar';
import { CustomDateFormatter } from '../../_services/dialogs/edit-calendar-dialog/custom-date-formatter.provider';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { TopicService } from '../../_services/topic/topic.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Meta, Title } from '@angular/platform-browser';

declare var FB: any;


@Component({
	selector: 'app-community-page',
	templateUrl: './community-page.component.html',
	styleUrls: ['./community-page.component.scss'],
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

export class CommunityPageComponent implements OnInit, AfterViewChecked {

	public communityId: string;
	public envVariable;
	public userId;
	public userType;
	public totalDuration: string;
	public userRating: number;
	public newUserRating = 0;
	public busyQuestion = false;
	public busyAnswer = false;
	public initialLoad = true;
	public loggedInUser;
	public noOfQuestions = 3;
	private initialised = false;
	public bookmarks;
	public hasBookmarked = false;
	public answeringToQuestionId: string;
	public community: any;
	public questionForm: FormGroup;
	public topicFix: any;
	public participants: Array<any>;
	public isRatingReceived = false;
	public maxLength = 140;
	public answerForm: FormGroup;
	public recommendations = {
		communities: []
	};
	public result;
	public questions: Array<any>;
	private today = moment();
	public toOpenDialogName;
	objectKeys = Object.keys;

	public questionMapping: { [k: string]: string } = {
		'=0': 'No Questions',
		'=1': 'One question',
		'other': '# questions'
	};

	public viewDate: Date = new Date();

	refresh: Subject<any> = new Subject();

	events: CalendarEvent[] = [];

	public loadingQuestions = true;
	public loadingParticipants = true;
	public loadingCommunity = true;
	public accountApproved = 'false';
	public carouselImages: Array<string>;
	public activeTab: string;
	public searchControl = new FormControl('');
	public searchResults: any[];
	public carouselBanner: any;

	constructor(public router: Router,
		private activatedRoute: ActivatedRoute,
		private _cookieUtilsService: CookieUtilsService,
		public _collectionService: CollectionService,
		public _topicService: TopicService,
		private _commentService: CommentService,
		private _questionService: QuestionService,
		private _communityService: CommunityService,
		public _searchService: SearchService,
		private _fb: FormBuilder,
		private dialog: MatDialog,
		private http: HttpClient,
		private _cdRef: ChangeDetectorRef,
		public dialogsService: DialogsService,
		private titleService: Title,
		private metaService: Meta,
		private snackBar: MatSnackBar) {
		this.envVariable = environment;
		this.activatedRoute.params.subscribe(params => {
			if (this.initialised && this.communityId !== params['communityId']) {
				location.reload();
			}
			this.communityId = params['communityId'];
			this.toOpenDialogName = params['dialogName'];
		});
		this.userId = _cookieUtilsService.getValue('userId');
		this.accountApproved = this._cookieUtilsService.getValue('accountApproved');
	}

	ngOnInit() {
		this.initialised = true;
		this.initializeCommunity();
		this.initialLoad = false;
		this.searchControl.valueChanges.subscribe((value) => {
			this._searchService.getCommunitySearchResults(this.userId, value, (err, result) => {
				if (!err) {
					this.searchResults = result;
				} else {
					console.log(err);
				}
			});
		});
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

	ngAfterViewChecked(): void {
		this._communityService.getActiveTab().subscribe(data => {
			this.activeTab = data;
		});
		this._cdRef.detectChanges();
	}


	private initializeUserType() {
		if (this.community) {
			for (const owner of this.community.owners) {
				if (owner.id === this.userId) {
					this.userType = 'owner';
					break;
				}
			}
			if (!this.userType) {
				this.userType = 'public';
				for (const participant of this.community.participants) {
					if (participant.id === this.userId) {
						this.userType = 'participant';
						break;
					}
				}
			}

			this.loadingCommunity = false;

		}
	}

	private initializeCommunity() {
		this.participants = [];
		const query = {
			'include': [
				'topics',
				'views',
				'invites',
				'rooms',
				{ 'collections': ['owners'] },
				'links',
				{ 'participants': [{ 'profiles': ['work'] }] },
				{ 'owners': [{ 'profiles': ['work'] }] }
			]
		};

		if (this.communityId) {
			this._communityService.getCommunityDetail(this.communityId, query)
				.subscribe(res => {
					console.log(res);
					this.community = res;
				},
					err => console.log('error'),
					() => {
						this.initializeUserType();
						this.fixTopics();
						this.getParticipants();
						this.getBookmarks();
						this.carouselImages = this.community.imageUrls.map(url => environment.apiUrl + url);
						this.setTags();
					});
		} else {
			console.log('NO COMMUNITY');
		}
	}

	private setTags() {
		this.titleService.setTitle(this.community.title);
		this.metaService.updateTag({
			property: 'og:title',
			content: this.community.title
		});
		this.metaService.updateTag({
			property: 'og:description',
			content: this.community.description
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'peerbuds.com'
		});
		this.metaService.updateTag({
			property: 'og:image',
			content: environment.apiUrl + this.community.imageUrls[0]
		});
		this.metaService.updateTag({
			property: 'og:url',
			content: environment.clientUrl + this.router.url
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
		this._communityService.getBookmarks(this.communityId, query, (err, response) => {
			if (err) {
				console.log(err);
			} else {
				this.bookmarks = response;
				this.bookmarks.forEach(bookmark => {
					if (bookmark.peer[0].id === this.userId) {
						this.hasBookmarked = true;
					}
				});
			}
		});
	}

	private fixTopics() {
		this.topicFix = _.uniqBy(this.community.topics, 'id');
	}

	public gotoEdit() {
		this.router.navigate(['community', this.communityId, 'edit', this.community.stage ? this.community.stage : '1']);
	}


	/**
	 * dropoutCommunity
	 */
	public dropOutCommunity() {
		this.dialogsService.openExitCommunity(this.communityId, this.userId).subscribe((response) => {
			if (response) {
				this.router.navigate(['community', this.communityId]);
			}
		});
	}

	/**
	 * deleteCommunity
	 */
	public deleteCommunity() {
		this.dialogsService.openDeleteCommunity(this.community).subscribe((response) => {
			if (response) {
				this.router.navigate(['/console/teaching/all']);
			}
		});
	}

	/**
	 * saveBookmark
	 */
	public saveBookmark() {
		if (!this.hasBookmarked) {
			this._communityService.saveBookmark(this.communityId, (err, response) => {
				if (err) {
					console.log(err);
				} else {
					this.getBookmarks();
				}
			});
		}
	}

	/**
	 * View participants
	 */
	public viewParticipants() {
		const dialogRef = this.dialog.open(ViewParticipantsComponent, {
			data: {
				participants: this.participants,
				communityId: this.communityId
			},
			panelClass: 'responsive-dialog',
			width: '45vw',
			height: '100vh'
		});
	}

	public joinCommunity() {
		this._communityService.addParticipant(this.communityId, this.userId, (err: any, response: any) => {
			if (err) {
				console.log(err);
			} else {
				this.initializeCommunity();
				this.snackBar.open('Thanks for joining the community. Ask questions or share your' +
					' find partners for your learning journey.', 'Close', {
						duration: 5000
					});
			}
		});
	}


	public getParticipants() {
		this.participants = [];
		this.loadingParticipants = true;
		const query = {
			'include': ['profiles', 'reviewsAboutYou', 'ownedCollections', 'ownedCommunities']
		};
		this._communityService.getParticipants(this.communityId, query).subscribe(
			(response: any) => {
				this.participants = response;
				for (const responseObj of response) {
					if (responseObj.id === this.userId) {
						this.loggedInUser = responseObj;
					}
				}
				this.loadingParticipants = false;
			}, (err) => {
				console.log(err);
			}
		);
	}

	public shareOnFb() {
		FB.ui({
			method: 'share_open_graph',
			action_type: 'og.shares',
			action_properties: JSON.stringify({
				object: {
					'og:url': environment.clientUrl + this.router.url, // your url to share
					'og:title': this.community.title,
					'og:site_name': 'Peerbuds',
					'og:description': this.community.description,
					'og:image': environment.apiUrl + this.community.imageUrls[0],
					'og:image:width': '250',
					'og:image:height': '257'
				}
			})
		}, function (response) {
			// Debug response (optional)
			console.log(response);
		});
	}

	public shareOnTwitter() {
		// TODO twitter sharing code
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
		this.dialogsService.inviteFriends(this.community);
	}

	scrollToQuestions() {
		const el = document.getElementById('questionTarget');
		el.scrollIntoView();
	}

	displayNone() {
		return 'display: none';
	}

	public parseTitle(title) {
		return title.split(':');
	}


	public getUserType() {
		return this.userType;
	}
}
