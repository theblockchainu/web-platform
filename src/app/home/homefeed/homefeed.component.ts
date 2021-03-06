import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../_services/collection/collection.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { TopicService } from '../../_services/topic/topic.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { CommunityService } from '../../_services/community/community.service';
import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

@Component({
	selector: 'app-feed',
	templateUrl: './homefeed.component.html',
	styleUrls: ['./homefeed.component.scss'],
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
export class HomefeedComponent implements OnInit {
	public classes: Array<any>;
	public experiences: Array<any>;
	public communities: Array<any>;
	public userId;
	public peers: Array<any>;
	public loadingClasses = false;
	public loadingExperiences = false;
	public loadingCommunities = false;
	public loadingPeers = false;
	public loadingContinueLearning = false;
	private today = moment();
	public envVariable;

	public ongoingArray: Array<any>;
	public upcomingArray: Array<any>;
	public pastArray: Array<any>;
	public pastClassesObject: any;
	public liveClassesObject: any;
	public upcomingClassesObject: any;
	public now: Date;
	public cardInFocus = false;

	constructor(
		public _collectionService: CollectionService,
		public _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		private _topicService: TopicService,
		public _dialogsService: DialogsService,
		public _communityService: CommunityService,
		private titleService: Title,
		private metaService: Meta,
		private router: Router,
		private titlecasepipe: TitleCasePipe
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}

	ngOnInit() {
		this.fetchContinueLearning();
		this.fetchClasses();
		this.fetchExperiences();
		this.fetchPeers();
		this.fetchCommunities();
		this.setTags();
	}

	private setTags() {
		this.titleService.setTitle('Peerbuds - Immersive & Incentivized Education');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Explore Peerbuds'
		});

		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'peerbuds.com'
		});
		this.metaService.updateTag({
			property: 'og:image',
			content: 'https://peerbuds.com/pb_logo_square.png'
		});
		this.metaService.updateTag({
			property: 'og:url',
			content: environment.clientUrl + this.router.url
		});
	}

	private fetchContinueLearning() {
		this.loadingContinueLearning = true;
		this._collectionService.getParticipatingCollections(this.userId,
			'{ "relInclude": "calendarId", "include": ' +
			'["calendars", {"owners":["profiles", "reviewsAboutYou", "ownedCollections"]},' +
			' {"participants": "profiles"}, "topics", {"contents":["schedules","views","submissions"]}, ' +
			'{"reviews":"peer"}] }', (err, result) => {
				if (err) {
					console.log(err);
				} else {
					this.ongoingArray = [];
					this.upcomingArray = [];
					this.liveClassesObject = {};
					this.upcomingClassesObject = {};
					this.createOutput(result);
					this.now = new Date();
					this.loadingContinueLearning = false;
				}
			});
	}

	private createOutput(data: any) {
		const now = moment();
		data.forEach(_class => {
			_class.calendars.forEach(calendar => {
				if (_class.calendarId === calendar.id && calendar.endDate) {
					if (now.diff(moment.utc(calendar.endDate)) < 0) {
						if (now.isBetween(calendar.startDate, calendar.endDate)) {
							if (_class.id in this.liveClassesObject) {
								this.liveClassesObject[_class.id]['class']['calendars'].push(calendar);
							} else {
								this.liveClassesObject[_class.id] = {};
								this.liveClassesObject[_class.id]['class'] = _.clone(_class);
								this.liveClassesObject[_class.id]['class']['calendars'] = [calendar];
							}
						}
					}
				}
			});
		});

		for (const key in this.liveClassesObject) {
			if (this.liveClassesObject.hasOwnProperty(key)) {
				this.ongoingArray.push(this.liveClassesObject[key].class);
			}
		}
	}

	/**
	 * Get the most upcoming content details
	 */
	public getLearnerUpcomingEvent(collection) {
		const contents = collection.contents;
		const calendars = collection.calendars;
		if (contents && contents.length > 0) {
			const currentCalendar = this.getLearnerCalendar(collection);
			contents.sort((a, b) => {
				if (a.schedules[0].startDay < b.schedules[0].startDay) {
					return -1;
				}
				if (a.schedules[0].startDay > b.schedules[0].startDay) {
					return 1;
				}
				return 0;
			}).filter((element, index) => {
				return moment() < moment(element.startDay);
			});
			let fillerWord = '';
			if (contents[0].type === 'online') {
				fillerWord = 'session';
			} else if (contents[0].type === 'video') {
				fillerWord = 'recording';
			} else if (contents[0].type === 'project') {
				fillerWord = 'submission';
			} else if (contents[0].type === 'in-person') {
				fillerWord = 'session';
			}
			if (currentCalendar) {
				const contentStartDate = moment(currentCalendar.startDate).add(contents[0].schedules[0].startDay, 'days');
				const timeToStart = contentStartDate.diff(moment(), 'days');
				contents[0].timeToStart = timeToStart;
			} else {
				contents[0].timeToStart = 0;
			}
			contents[0].fillerWord = fillerWord;
			contents[0].hasStarted = false;
			return contents[0];
		} else {
			return {};
		}
	}

	/**
	 * get calendar signed up by this learner
	 */
	public getLearnerCalendar(collection) {
		if (collection.calendarId === undefined) {
			return null;
		} else {
			return collection.calendars.find((calendar) => {
				return calendar.id === collection.calendarId;
			});
		}
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
		this._topicService.getTopics(query).subscribe(
			(response: any) => {
				this.loadingClasses = false;
				this.classes = [];
				for (const responseObj of response) {
					responseObj.collections.forEach(collection => {
						if (collection.status === 'active') {
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
		this._topicService.getTopics(query).subscribe(
			(response: any) => {
				this.loadingExperiences = false;
				this.experiences = [];
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

			}, (err) => {
				console.log(err);
			}
		);
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

}

