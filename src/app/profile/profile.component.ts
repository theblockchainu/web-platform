import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import { ProfileService } from '../_services/profile/profile.service';
import { CollectionService } from '../_services/collection/collection.service';
import { DialogsService } from '../_services/dialogs/dialog.service';
import { TopicService } from '../_services/topic/topic.service';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { environment } from '../../environments/environment';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Meta, Title } from '@angular/platform-browser';
import { TitleCasePipe } from '@angular/common';
import { KnowledgeStoryService } from '../_services/knowledge-story/knowledge-story.service';
import { flatMap, map } from 'rxjs/operators';
@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss'],
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
export class ProfileComponent implements OnInit {
	public cookieUserId;
	public loadingProfile;
	public loadingLearningJourney;
	public loadingPeers;
	public loadingKnowledgeStories;
	public envVariable;
	public urluserId: string;
	public profileObj: any;
	public peerObj: any;
	public interestsArray: Array<string>;
	public userRating: number;
	public collectionTypes: Array<string>;
	public participatingClasses: Array<any>;
	public recommendedpeers: Array<any>;
	public socialIdentities: any;
	public maxVisibleInterest: number;
	public maxVisibleReviewsTeacher: number;
	public maxVisibleReviewsLearner: number;
	public topicsTeaching: Array<any>;
	public reviewsFromLearners: Array<any>;
	public reviewsFromTeachers: Array<any>;
	public isTeacher: boolean;
	public offsetString: string;
	private queryForSocialIdentities: any;
	public connectedIdentities: any;
	public other_languages;
	public today: Date;
	public pastClasses: Array<any>;
	public ongoingClasses: Array<any>;
	public upcomingClasses: Array<any>;
	public pastExperiences: Array<any>;
	public ongoingExperiences: Array<any>;
	public upcomingExperiences: Array<any>;
	public availablePaidPackages: Array<any>;
	public availableTrialPackages: Array<any>;
	public maxLength: number;
	public learningJourneyFilter: string;
	public sessionId;
	public blankCardArray: Array<number>;
	public loadingCommunities: boolean;
	public pariticipatingCommunities: any;
	public searchTopicURL = '';
	public knowledgeStories: Array<any>;
	public dialogToOpen;

	constructor(
		public _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public _collectionService: CollectionService,
		private _topicService: TopicService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		public _dialogsService: DialogsService,
		private titleService: Title,
		private metaService: Meta,
		private titlecasepipe: TitleCasePipe,
		private _knowledgeStoryService: KnowledgeStoryService
	) {
		this.envVariable = environment;
		this.activatedRoute.params.subscribe((param) => {
			const calledUserId = param['profileId'];
			this.dialogToOpen = param['dialogToOpen'];
			if (this.urluserId !== calledUserId) {
				this.urluserId = calledUserId;
				this.fetchData();
				window.scrollTo(0, 0);
			}
		});
		this.searchTopicURL = environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics/suggest?field=name&query=';
		if (this.dialogToOpen && this.dialogToOpen === 'story') {
			this.generateKnowledgeStoryDialog();
		}
	}

	ngOnInit() {
	}

	public showAll(strLength) {
		if (strLength > this.maxLength) {
			this.maxLength = strLength;
		} else {
			this.maxLength = 140;
		}
	}

	private fetchData() {
		this.cookieUserId = this._cookieUtilsService.getValue('userId');
		this.loadingProfile = true;
		this.isTeacher = false;
		this.loadingLearningJourney = true;
		this.loadingCommunities = true;
		this.loadingPeers = true;
		this.loadingKnowledgeStories = true;
		this.collectionTypes = ['classes'];
		this.recommendedpeers = [];
		this.socialIdentities = {};
		this.maxVisibleInterest = 3;
		this.maxVisibleReviewsTeacher = 4;
		this.maxVisibleReviewsLearner = 4;
		this.topicsTeaching = [];
		this.reviewsFromLearners = [];
		this.reviewsFromTeachers = [];
		this.queryForSocialIdentities = { 'include': ['identities', 'credentials'] };
		this.participatingClasses = [];
		this.connectedIdentities = {
			'facebook': false,
			'google': false
		};
		this.today = new Date();
		this.maxLength = 140;
		this.blankCardArray = [4, 3, 2, 1, 0];
		this.getPeerData();

	}

	public getPeerData() {
		this._profileService.getPeerNode(this.urluserId).subscribe((result: any) => {
			if (result) {
				this.peerObj = result;
				this.getProfileData();
				this.getKnowledgeStories();
			} else {
				this.getDataFromCustomURL();
			}
		}, err => {
			this.getDataFromCustomURL();
		});
	}

	private getDataFromCustomURL() {
		const query = {
			where: {
				customUrl: this.urluserId
			},
			include: [{ 'collections': 'owners' }]
		};
		this._collectionService.getPreferences(query).subscribe((res: any) => {
			if (res && res.length > 0) {
				const preference = res[0];
				this.peerObj = preference.collections[0].owners[0];
				this.urluserId = this.peerObj.id;
				this.getProfileData();
				this.getKnowledgeStories();
			} else {
				console.log('Not Found');
			}
		}, err => {
			console.log('Not Found');
		});
	}


	private getIdentities() {
		this._profileService.getSocialIdentities(this.queryForSocialIdentities, this.urluserId).subscribe(
			(result) => {
				this.socialIdentities = result;
				if (this.socialIdentities.identities.length > 0) {
					this.socialIdentities.identities.forEach(element => {
						if (element.provider === 'google') {
							this.connectedIdentities.google = true;
						} else if (element.provider === 'facebook') {
							this.connectedIdentities.facebook = true;
						}
					});
				}
				if (this.socialIdentities.credentials.length > 0) {
					this.socialIdentities.credentials.forEach(element => {
						if (element.provider === 'google') {
							this.connectedIdentities.google = true;
						} else if (element.provider === 'facebook') {
							this.connectedIdentities.facebook = true;
						}
					});
				}
				this.getTeachingTopics();
			}
		);
	}

	private getRecommendedPeers() {
		const query = {
			'include': [
				'reviewsAboutYou',
				'wallet',
				'profiles',
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
					{ 'id': { 'neq': this.urluserId } },
					{ 'accountVerified': true }
				]
			},
			'limit': 50,
			'order': 'createdAt DESC'
		};
		this._profileService.getAllPeers(query).subscribe((result: any) => {
			this.recommendedpeers = [];
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
						if (this.recommendedpeers.length < 6) {
							this.recommendedpeers.push(responseObj);
						}
					}
				}
			}
			this.loadingPeers = false;
		}, (err) => {
			console.log(err);
		});
	}

	private getTeachingTopics() {
		this.loadingLearningJourney = true;
		const queryTeaching = {
			'relInclude': 'experience'
		};
		this._profileService.getTeachingExternalTopics(this.urluserId, queryTeaching).subscribe((response: any) => {
			// console.log(response);
			this.topicsTeaching = response;
			if (this.profileObj.peer[0].collections) {
				this.getParticipatingClasses(this.profileObj.peer[0].collections);
			} else {
				this.loadingLearningJourney = false;
				this.loadingPeers = true;
			}
			this.getRecommendedPeers();
			this.getParticipatingCommunities(this.profileObj.peer[0].id);
		});
	}

	private getParticipatingCommunities(peerId: string) {
		this.loadingCommunities = true;
		const query = {
			'include': [
				{ 'participants': 'profiles' },
				'questions',
				'topics'
			]
		};
		this._profileService.getJoinedCommunities(peerId, query).subscribe(res => {
			console.log(res);
			this.pariticipatingCommunities = [];
			/*res.forEach(community => {
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
					this.pariticipatingCommunities.push(community);
				}
			});*/
			this.loadingCommunities = false;
			this.loadingProfile = false;
		});
	}


	private getParticipatingClasses(response: Array<any>) {
		response.forEach(collection => {
			if (collection.reviews) {
				collection.rating = this._collectionService.calculateRating(collection.reviews);
			}
			this.participatingClasses.push(collection);
		});
		this.participatingClasses = _.uniqBy(this.participatingClasses, 'id');
		this.loadingLearningJourney = false;
		this.loadingPeers = true;
	}

	private getProfileData() {
		const query = {
			'include': [
				'education',
				'work',
				{
					'peer': [
						'wallet',
						{
							'token_transactions': [
								'collections',
								'communities',
								'contents',
								'peers'
							]
						},
						'topicsLearning',
						'topicsTeaching',
						{
							'ownedCollections': [
								{ 'contents': ['schedules'] }
								, 'calendars', 'packages']
						},
						{ 'reviewsAboutYou': { 'peer': 'profiles' } },
						{
							'collections': [{ 'reviews': { 'peer': 'profiles' } }, { 'owners': ['profiles'] }],
						}
					]
				}
			]
		};
		this._profileService.getExternalProfileData(this.urluserId, query).subscribe((response: any) => {
			this.profileObj = response[0];
			console.log(this.profileObj);
			if (this.profileObj.other_languages) {
				this.profileObj.other_languages = this.profileObj.other_languages.filter(Boolean);
				this.other_languages = this.profileObj.other_languages.join(', ');
			} else {
				this.other_languages = '';
			}

			this.setInterests();
			if (this.profileObj.peer[0].ownedCollections && this.profileObj.peer[0].ownedCollections.length > 0) {
				this.calculateCollectionDurations();
				this.computeReviews();
				this.isTeacher = true;
				this.offsetString = 'col-md-offset-1';
			} else {
				this.offsetString = 'custom-margin-left-20pc';
			}
			if (this.profileObj.peer[0].reviewsAboutYou) {
				this.userRating = this._collectionService.calculateRating(this.profileObj.peer[0].reviewsAboutYou);
			}
			this.getIdentities();
			this.setTags();
		});
	}

	private setTags() {
		let peerName = '';
		if (this.profileObj.first_name !== undefined) {
			peerName = this.profileObj.first_name + ' ' + this.profileObj.last_name;
		} else {
			peerName = 'New user';
		}
		this.titleService.setTitle(peerName);
		this.metaService.updateTag({
			property: 'og:title',
			content: peerName
		});
		this.metaService.updateTag({
			property: 'og:description',
			content: this.profileObj.headline || 'Peerbuds is the world\'s first blockchain powered education platform focused around interactive and community based learning'
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'peerbuds.com'
		});
		this.metaService.updateTag({
			property: 'og:image',
			content: environment.apiUrl + this.profileObj.picture_url
		});
		this.metaService.updateTag({
			property: 'og:url',
			content: environment.clientUrl + this.router.url
		});
	}

	private computeReviews() {
		// Compute reviews for Peer from Learner and Teachers
		const ownedCollectionsArray = this.profileObj.peer[0].ownedCollections;
		const reviewsAboutYou = this.profileObj.peer[0].reviewsAboutYou;
		if (reviewsAboutYou) {
			reviewsAboutYou.forEach(collection => {
				if (_.find(ownedCollectionsArray, function (o) { return o.id === collection.collectionId; })) {
					this.reviewsFromLearners.push(collection);
				} else {
					this.reviewsFromTeachers.push(collection);
				}
			});
		}
	}

	private setInterests() {
		this.interestsArray = [];
		if (this.profileObj.peer[0].topicsTeaching && this.profileObj.peer[0].topicsTeaching.length > 0) {
			this.profileObj.peer[0].topicsTeaching.forEach(topic => {
				this.interestsArray.push(topic.name);
			});
		}
		if (this.profileObj.peer[0].topicsLearning && this.profileObj.peer[0].topicsLearning.length > 0) {
			this.profileObj.peer[0].topicsLearning.forEach(topic => {
				if (!this.interestsArray.includes(topic.name)) {
					this.interestsArray.push(topic.name);
				}
			});
		}
	}

	private calculateCollectionDurations() {
		this.pastClasses = [];
		this.upcomingClasses = [];
		this.ongoingClasses = [];
		this.pastExperiences = [];
		this.upcomingExperiences = [];
		this.ongoingExperiences = [];
		this.availablePaidPackages = [];
		this.availableTrialPackages = [];
		this.profileObj.peer['0'].ownedCollections.forEach(collection => {
			if (collection.status === 'active') {
				collection.totalDuration = this.calculateTotalHours(collection);
				collection.itenaryArray = this.calculateItenaries(collection);
				collection = this.calculateCohorts(collection);
				if (collection.type === 'class' && collection.pastCohortCount > 0) {
					this.pastClasses.push(collection);
				}
				if (collection.type === 'class' && collection.upcomingCohortCount > 0) {
					this.upcomingClasses.push(collection);
				}
				if (collection.type === 'class' && collection.currentCohortCount > 0) {
					this.ongoingClasses.push(collection);
				}
				if (collection.type === 'experience' && collection.pastCohortCount > 0) {
					this.pastExperiences.push(collection);
				}
				if (collection.type === 'experience' && collection.upcomingCohortCount > 0) {
					this.upcomingExperiences.push(collection);
				}
				if (collection.type === 'experience' && collection.currentCohortCount > 0) {
					this.ongoingExperiences.push(collection);
				}
				if (collection.type === 'session') {
					this.sessionId = collection.id;
					collection.packages.forEach(packageObj => {
						if (packageObj.type === 'paid') {
							this.availablePaidPackages.push(packageObj);
						} else {
							this.availableTrialPackages.push(packageObj);
						}
					});
				}
			}
		});
	}

	private calculateCohorts(collection): any {
		collection.pastCohortCount = 0;
		collection.upcomingCohortCount = 0;
		collection.currentCohortCount = 0;

		if (collection.calendars) {
			collection.calendars.forEach(calendar => {
				if (calendar.endDate < this.today.toISOString()) {
					collection.pastCohortCount++;
				}
				if (calendar.startDate > this.today.toISOString()) {
					collection.upcomingCohortCount++;
				}
				if (calendar.endDate > this.today.toISOString() && calendar.startDate < this.today.toISOString()) {
					collection.currentCohortCount++;
				}
			});
		}
		return collection;
	}

	private calculateItenaries(_class) {
		const itenariesObj = {};
		const itenaryArray = [];
		if (_class.contents) {
			_class.contents.forEach(contentObj => {
				if (itenariesObj.hasOwnProperty(contentObj.schedules[0].startDay)) {
					itenariesObj[contentObj.schedules[0].startDay].push(contentObj);
				} else {
					itenariesObj[contentObj.schedules[0].startDay] = [contentObj];
				}
			});

			for (const key in itenariesObj) {
				if (itenariesObj.hasOwnProperty(key)) {
					itenariesObj[key].sort(function (a, b) {
						return parseFloat(a.schedules[0].startTime) - parseFloat(b.schedules[0].startTime);
					});
					const itenary = {
						startDay: key,
						contents: itenariesObj[key]
					};
					itenaryArray.push(itenary);
				}
			}
			itenaryArray.sort(function (a, b) {
				return parseFloat(a.startDay) - parseFloat(b.startDay);
			});
		}
		return itenaryArray;
	}

	/**
	 * calculateTotalHours
	 */
	public calculateTotalHours(_class) {
		let totalLength = 0;
		if (_class.contents) {
			_class.contents.forEach(content => {
				if (content.type === 'online') {
					const startMoment = moment(content.schedules[0].startTime);
					const endMoment = moment(content.schedules[0].endTime);
					const contentLength = moment.utc(endMoment.diff(startMoment)).format('HH');
					totalLength += parseInt(contentLength, 10);
				} else if (content.type === 'video') {

				}
			});
		}
		return totalLength.toString();
	}

	public toggleMaxInterest() {
		if (this.maxVisibleInterest === 3) {
			this.maxVisibleInterest = 999;
		} else {
			this.maxVisibleInterest = 3;
		}
	}

	public toggleMaxReviewsTeacher() {
		if (this.maxVisibleReviewsTeacher === 4) {
			this.maxVisibleReviewsTeacher = 999;
		} else {
			this.maxVisibleReviewsTeacher = 4;
		}
	}

	public toggleMaxReviewsLearner() {
		if (this.maxVisibleReviewsLearner === 4) {
			this.maxVisibleReviewsLearner = 999;
		} else {
			this.maxVisibleReviewsLearner = 4;
		}
	}

	public reportProfile() {
		this._dialogsService.reportProfile().subscribe((result: any) => {
			if (result) {
				// console.log('report' + result);
				this._profileService.reportProfile(this.urluserId, {
					'description': result,
					'is_active': true
				}).subscribe((respone) => {
					// console.log(respone);
					this.snackBar.open('Profile Reported', 'Close', {
						duration: 5000
					});
				}, (err) => {
					this.snackBar.open('Profile Reported Failed', 'Retry', {
						duration: 5000
					}).onAction().subscribe(() => {
						this.reportProfile();
					});
				});
			}
		});
	}

	public navigateTo(id: string) {
		this.router.navigate(['profile', id]);
	}

	imgErrorHandler(event) {
		event.target.src = '/assets/images/user-placeholder.jpg';
	}

	public getReviewedCollection(peer, collectionId) {
		let foundCollection: any;
		const collectionsArray = peer.collections;
		const ownedCollectionsArray = peer.ownedCollections;
		if (collectionsArray !== undefined) {
			foundCollection = collectionsArray.find((collection) => {
				return collection.id === collectionId;
			});
		}
		if (ownedCollectionsArray !== undefined && foundCollection === undefined) {
			foundCollection = ownedCollectionsArray.find((collection) => {
				return collection.id === collectionId;
			});
		}
		if (foundCollection === undefined) {
			foundCollection = {};
		}
		return foundCollection;

	}

	public getReviewedCalendar(calendars, calendarId) {
		if (calendars) {
			return calendars.find((calendar) => {
				return calendar.id === calendarId;
			}) !== undefined ? calendars.find((calendar) => {
				return calendar.id === calendarId;
			}) : {};
		} else {
			return {};
		}
	}

	public redirectToCollection(peer, reviewCollectionId, collectionCalendarId) {
		return '/' + this.getReviewedCollection(peer, reviewCollectionId).type + '/'
			+ reviewCollectionId + '/calendar/' + collectionCalendarId + '';
	}

	/**
	 * openCollectionGrid
	 type:string,title:string,collecions   */
	public openCollectionGrid(title: string, collections: Array<any>) {
		this._dialogsService.openCollectionGrid(title, collections).subscribe((result: any) => {
			if (result) {
				this.router.navigateByUrl('/' + collections[0].type + '/' + result);
			}
		});
	}

	/**
	 * bookSession
	 */
	public bookSession() {
		this.router.navigateByUrl('/session/book/' + this.urluserId);
	}

	/**
	 * OPen session wizard to update availability
	 */
	public updateAvailability() {
		this.router.navigateByUrl('/session/' + this.sessionId + '/edit/10');
	}

	public openMessageDialog() {
		this.peerObj.profiles = [];
		this.peerObj.profiles.push(this.profileObj);
		this._dialogsService.messageParticipant(this.peerObj).subscribe((result: any) => {
			// console.log(result);
		});
	}

	/**
	 * openTransactionsDialog
	 */
	public openTransactionsDialog() {
		this._dialogsService.gyanTransactionsDialog(this.profileObj).subscribe(res => {
			console.log(res);
		});
	}

	public generateKnowledgeStoryDialog() {
		const inputs = {
			title: 'Select some or all of the topics you learn or teach...',
			minSelection: 1,
			searchTopicURL: this.searchTopicURL,
			suggestedTopics: []
		};
		const topics = [];
		const peers = [];
		this._dialogsService.generateKnowledgeStoryDialog(this.cookieUserId, inputs)
			.subscribe((dialogResult: any) => {
				let createdKnowledgeStoryId;
				if (dialogResult) {
					dialogResult.selectedTopics.forEach(topic => {
						topics.push(topic.id);
					});
					dialogResult.selectedPeers.forEach(peer => {
						peers.push(peer.id);
					});
					this._knowledgeStoryService.createKnowledgeStoryRequest(this.urluserId, {
						status: 'approved',
						visibility: (peers.length === 0) ? 'public' : 'private'
					}).pipe(
						flatMap((res: any) => {
							console.log(res);
							createdKnowledgeStoryId = res.id;
							return this._knowledgeStoryService.connectTopics(res.id, { targetIds: topics }).pipe(
								map(
									(result: any) => {
										this._knowledgeStoryService.connectPeers(res.id, { targetIds: peers }).subscribe(peersConnected => {
											console.log('peers connected');
										});
									})
							);
						})
					).subscribe(res => {
						console.log(res);
						this.getKnowledgeStories();
						this.snackBar.open('Your knowledge story has been created.', 'Close', { duration: 5000 });
						this.router.navigate(['story', createdKnowledgeStoryId]);
					}, err => {
						console.log(err);
						this.snackBar.open('Error. Could not generate your knowledge story.', 'Close', { duration: 5000 });
					});
				}
			});

	}

	/**
	 * requestKnowledgeStory
	 */
	public requestKnowledgeStory() {
		const inputs = {
			title: 'Start typing to select from a list of available topics...',
			minSelection: 1,
			searchTopicURL: this.searchTopicURL,
			suggestedTopics: []
		};
		const topics: Array<string> = [];
		this._dialogsService.requestStoryDialog(this.cookieUserId, inputs)
			.subscribe((result: any) => {
				if (result) {
					result.forEach(topic => {
						topics.push(topic.id);
					});
					this._knowledgeStoryService.createKnowledgeStoryRequest(this.urluserId, {
						status: 'pending',
						visibility: 'private'
					}).pipe(
						flatMap((res: any) => {
							return this._knowledgeStoryService.connectTopics(res.id, { targetIds: topics });
						})
					).subscribe(res => {
						if (res) {
							console.log(res);
							this.getKnowledgeStories();
							this.snackBar.open('Your request for knowledge story has been sent.', 'Close', { duration: 5000 });
						} else {
							this.snackBar.open('Could not send knowledge story request. Try again.', 'Close', { duration: 5000 });
						}
					}, err => {
						console.log(err);
						this.snackBar.open('Could not send knowledge story request. Try again.', 'Close', { duration: 5000 });
					});
				}
			});
	}

	getKnowledgeStories() {
		const filter = {
			'include': [{ 'protagonist': 'profiles' }, { 'peer': 'profiles' }, 'topics'],
			'where': { 'status': { 'eq': 'approved' } }
		};
		this.knowledgeStories = [];
		this._knowledgeStoryService.getknowledgeStoryRequests(this.urluserId, filter).subscribe((res: any) => {
			console.log(res);
			res.forEach(story => {
				if (story.visibility === 'public') {
					this.knowledgeStories.push(story);
				} else {
					for (let i = 0; i < story.peer.length; i++) {
						const peer = story.peer[i];
						if (peer.id === this.cookieUserId) {
							this.knowledgeStories.push(story);
							break;
						}
					}
				}
			});
			this.loadingKnowledgeStories = false;
		});
	}

	public openStory(story) {
		if (story.status === 'approved') {
			this.router.navigate(['story', story.id]);
		} else {
			this.snackBar.open('Cannot open this story as it is yet to be approved.', 'Ok', { duration: 5000 });
		}
	}
}
