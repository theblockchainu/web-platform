import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { TopicService } from '../../_services/topic/topic.service';
import { CommunityService } from '../../_services/community/community.service';
import { TitleCasePipe } from '@angular/common';
import { SearchService } from '../../_services/search/search.service';
import { first } from 'rxjs/operators';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
	selector: 'app-index',
	templateUrl: './index.component.html',
	styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
	public loadingHome = false;
	private email: string;
	notifyForm: FormGroup;
	public loggedIn = false;
	public userId;


	public classes: Array<any>;
	public experiences: Array<any>;
	public communities: Array<any>;
	public peers: Array<any>;
	public loadingClasses = false;
	public loadingExperiences = false;
	public loadingCommunities = false;
	public loadingPeers = false;
	public loadingContinueLearning = false;
	private today = moment();
	public envVariable;

	public classesCount: number;
	public experiencesCount: number;
	public communitiesCount: number;

	public ongoingArray: Array<any>;
	public upcomingArray: Array<any>;
	public pastArray: Array<any>;
	public pastClassesObject: any;
	public liveClassesObject: any;
	public upcomingClassesObject: any;
	public now: Date;
	public cardInFocus = false;
	public myControl = new FormControl('');
	public options: any[];
	public searching: boolean;

	constructor(
		private authenticationService: AuthenticationService,
		public _fb: FormBuilder,
		private _router: Router,
		public dialog: MatDialog,
		private http: HttpClient,
		public snackBar: MatSnackBar,
		private _cookieUtilsService: CookieUtilsService,
		private titleService: Title,
		private metaService: Meta,
		private dialogsService: DialogsService,
		private _activatedRoute: ActivatedRoute,
		public _collectionService: CollectionService,
		private _topicService: TopicService,
		public _communityService: CommunityService,
		private titlecasepipe: TitleCasePipe,
		public _profileService: ProfileService,
		public _searchService: SearchService
	) {
	}
	ngOnInit() {
		this.loadingHome = false;
		this.notifyForm = this._fb.group(
			{ email: ['', [Validators.required, Validators.email]] }
		);

		this.userId = this._cookieUtilsService.getValue('userId');
		this.authenticationService.isLoggedIn().pipe(first()).subscribe((res: any) => {
			this.loggedIn = res;
			if (this.loggedIn) {
				this._router.navigate(['home', 'homefeed']);
			}
		});
		this._activatedRoute.url.pipe(first()).subscribe(res => {
			if (res[0] && res[0].path === 'login') {
				if (!this.loggedIn) {
					this.dialogsService.openLogin().subscribe();
				}
			}
		});

		this.setTags();
		this.fetchClasses();
		this.fetchExperiences();
		this.fetchPeers();
		this.fetchCommunities();
		this.initialiseSearchService();
	}

	initialiseSearchService() {
		this.myControl.valueChanges.subscribe((value) => {
			console.log(value);
			this.options = [];
			if (value && value.length > 0) {
				this.searching = true;
				this._searchService.getAllSearchResults(null, value, (err, result) => {
					if (!err) {
						this.options = result;
						this.searching = false;
					} else {
						console.log(err);
						this.searching = false;
					}
				});
			} else {
				this.searching = false;
				this.options = [];
			}
		});
	}
	public openVideo() {
		const url = '/assets/video/homepageExplainer.mp4';
		this.dialogsService.openVideo(url).subscribe();
	}
	public sendEmailSubscriptions() {
		if (this.notifyForm.valid) {
			this.email = this.notifyForm.controls['email'].value;
			this.authenticationService.sendEmailSubscriptions(this.email)
				.subscribe();
			this.snackBar.open('We have registered your email for all our future updates.', 'Thanks', {
				duration: 5000
			});
		} else {
			this.snackBar.open('Please enter a valid email address', 'Ok', {
				duration: 5000
			});
		}
	}

	public openSignup() {
		this.dialogsService.openSignup('invite/1').subscribe();
	}

	public openTelegram() {
		window.location.href = 'https://t.me/theblockchainu';
	}

	private setTags() {
		this.titleService.setTitle('The Blockchain University - World largest community of Blockchain Certified Professionals');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'The Blockchain University - World largest community of Blockchain Certified Professionals'
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
			content: environment.clientUrl + this._router.url
		});
	}

	fetchClasses() {
		const query = {
			'include': [
				{
					'relation': 'collections', 'scope': {
						'include': [
							{ 'owners': ['reviewsAboutYou', 'profiles'] },
							'participants',
							'calendars',
							{ 'bookmarks': 'peer' }
						],
						'where': { 'type': 'class' }
					}
				}
			],
			'order': 'createdAt desc'
		};
		this.loadingClasses = true;
		this.classes = [];
		this._topicService.getTopics(query).subscribe(
			(response: any) => {
				this.loadingClasses = false;
				for (const responseObj of response) {
					responseObj.collections.forEach(collection => {
						if (collection.status === 'active') {
							console.log(collection);
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
								this.classes.push(collection);
							}
						}
					});
				}
				this.classes = _.uniqBy(this.classes, 'id');
				this.classes = _.orderBy(this.classes, ['createdAt'], ['desc']);
				this.classes = _.chunk(this.classes, 5)[0];
			}, (err) => {
				console.log(err);
			}
		);

		this._collectionService.getTotalCollectionCount('type', 'class').subscribe((res: any) => {
			this.classesCount = res.count;
		});
	}

	fetchExperiences() {
		const query = {
			'include': [
				{
					'relation': 'collections', 'scope': {
						'include':
							[{ 'owners': ['reviewsAboutYou', 'profiles'] },
								'participants',
								'calendars', { 'bookmarks': 'peer' }, {
								'contents':
									['schedules', 'locations']
							}], 'where': { 'type': 'experience' }
					}
				}
			],
			'order': 'createdAt desc'
		};
		this.loadingExperiences = true;
		this.experiences = [];
		this._topicService.getTopics(query).subscribe(
			(response: any) => {
				for (const responseObj of response) {
					responseObj.collections.forEach(collection => {
						let experienceLocation = 'Unknown location';
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
										experienceLocation = content.locations[0].city;
										lat = parseFloat(content.locations[0].map_lat);
										lng = parseFloat(content.locations[0].map_lng);
									}
								});
								collection.location = experienceLocation;
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
								this.experiences.push(collection);
							}

						}
					});
				}
				this.experiences = _.uniqBy(this.experiences, 'id');
				this.experiences = _.orderBy(this.experiences, ['createdAt'], ['desc']);
				this.experiences = _.chunk(this.experiences, 5)[0];
				console.log(this.experiences);
				this.loadingExperiences = false;
			}, (err) => {
				console.log(err);
			}
		);

		this._collectionService.getTotalCollectionCount('type', 'experience').subscribe((res: any) => {
			this.experiencesCount = res.count;
		});

	}

	fetchCommunities() {
		const query = {
			'include': [
				{
					'relation': 'communities', 'scope': {
						'include': [
							'topics',
							'questions',
							'views',
							'invites',
							'rooms',
							{ 'collections': ['owners'] },
							'links',
							{ 'participants': [{ 'profiles': ['work'] }] },
							{ 'owners': [{ 'profiles': ['work'] }] }
						]
					}
				}
			],
			'order': 'createdAt desc'
		};
		this.loadingCommunities = true;
		this._topicService.getTopics(query).subscribe(
			(response: any) => {
				this.loadingCommunities = false;
				this.communities = [];
				for (const responseObj of response) {
					responseObj.communities.forEach(community => {
						if (community.status === 'active') {
							let totalGyan = 0;
							if (community.questions) {
								community.questions.forEach(question => {
									if (question.gyan !== undefined && question.gyan > 0) {
										totalGyan += parseInt(question.gyan, 10);
									}
								});
							}
							const participants = [];
							community.allParticipants = community.participants;
							if (community.participants) {
								community.participants.forEach((participant, index) => {
									if (index < 4) {
										participants.push(participant);
									}
								});
							}
							community.participants = participants;
							const topics = [];
							community.topics.forEach(topicObj => {
								topics.push(this.titlecasepipe.transform(topicObj.name));
							});
							if (topics.length > 0) {
								community.topics = topics;
							} else {
								topics.push('No topics selected');
								community.topics = topics;
							}
							community.gyan = totalGyan;
							this.communities.push(community);
						}
					});
				}
				this.communities = _.uniqBy(this.communities, 'id');
				this.communities = _.orderBy(this.communities, ['createdAt'], ['desc']);
				this.communities = _.chunk(this.communities, 5)[0];

			}, (err) => {
				console.log(err);
			}
		);

		const where = {
			'where': { 'type': 'experience' }
		};

		this._communityService.totalCommunititesCount().subscribe((res: any) => {
			this.communitiesCount = res.count;
			console.log(res);
		});

	}


	fetchPeers() {
		const query = {
			'include': [
				'reviewsAboutYou',
				'profiles',
				'wallet',
				'topicsTeaching',
				{
					'relation': 'ownedCollections',
					'scope': {
						'where': {
							'type': 'session'
						}
					}
				}
			],
			'where': {
				and: [
					{ 'id': { 'neq': this.userId } },
					{ 'accountVerified': true }
				]
			},
			'limit': 50,
			'order': 'createdAt DESC'
		};
		this.loadingPeers = true;
		this._profileService.getAllPeers(query).subscribe((result: any) => {
			this.peers = [];
			let isTeacher = false;
			for (const responseObj of result) {
				if (responseObj.ownedCollections && responseObj.ownedCollections.length > 0 && responseObj.topicsTeaching && responseObj.topicsTeaching.length > 0) {
					responseObj.ownedCollections.forEach(ownedCollection => {
						if (ownedCollection.status === 'active') {
							isTeacher = true;
						}
					});
					if (isTeacher) {
						responseObj.rating = this._collectionService.calculateRating(responseObj.reviewsAboutYou);
						const topics = [];
						responseObj.topicsTeaching.forEach(topicObj => {
							topics.push(this.titlecasepipe.transform(topicObj.name));
						});
						if (topics.length > 0) {
							responseObj.topics = topics;
						} else {
							topics.push('No topics selected');
							responseObj.topics = topics;
						}
						if (this.peers.length <= 6) {
							this.peers.push(responseObj);
						}
					} else {
						responseObj.rating = this._collectionService.calculateRating(responseObj.reviewsAboutYou);
						const topics = [];
						if (responseObj.topicsTeaching) {
							responseObj.topicsTeaching.forEach(topicObj => {
								topics.push(this.titlecasepipe.transform(topicObj.name));
							});
						}
						if (topics.length > 0) {
							responseObj.topics = topics;
						} else {
							topics.push('No topics selected');
							responseObj.topics = topics;
						}
						if (this.peers.length <= 6) {
							this.peers.push(responseObj);
						}
					}
				}
			}
			this.loadingPeers = false;
		}, (err) => {
			console.log(err);
		});
	}

	public onExperienceRefresh(event) {
		if (event) {
			this.fetchExperiences();
		}
	}

	public onCommunityRefresh(event) {
		if (event) {
			this.fetchCommunities();
		}
	}

	public onClassRefresh(event) {
		if (event) {
			this.fetchClasses();
		}
	}

	public openLogin() {
		this.dialogsService.openLogin().subscribe(
			res => {
				if (res) {
					this._router.navigate(['home', 'homefeed']);
				}
			}
		);
	}

	public onSearchOptionClicked(option) {
		this._searchService.onSearchOptionClicked(option);
		this.myControl.reset();
	}
	public createExperience() {
		this._router.navigate(['digest', 'experiences']);
	}

	public createClass() {
		this._router.navigate(['digest', 'classes']);
	}

	public createSession() {
		this._router.navigate(['digest', 'peers']);
	}

	public gotoCredit() {
		this.dialogsService.openLogin().subscribe((result: any) => {
			if (result) {
				this._router.navigateByUrl('/invite/1');
			}
		});
	}
}
