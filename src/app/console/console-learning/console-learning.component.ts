import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CollectionService } from '../../_services/collection/collection.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { ConsoleComponent } from '../console.component';

declare var moment: any;

@Component({
	selector: 'app-console-learning',
	templateUrl: './console-learning.component.html',
	styleUrls: ['./console-learning.component.scss', '../console.component.scss']
})
export class ConsoleLearningComponent implements OnInit {
	
	public classes: any;
	public loaded: boolean;
	public activeTab: string;
	public now: Date;
	public userId;
	public accountVerified: boolean;
	
	constructor(
		private activatedRoute: ActivatedRoute,
		public router: Router,
		public _collectionService: CollectionService,
		public consoleComponent: ConsoleComponent,
		private _cookieUtilsService: CookieUtilsService) {
		activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
			console.log(urlSegment[0].path);
			consoleComponent.setActiveTab(urlSegment[0].path);
		});
		this.activeTab = 'all';
		this.now = new Date();
		this.userId = _cookieUtilsService.getValue('userId');
		this.accountVerified = (this._cookieUtilsService.getValue('accountApproved') === 'true');
	}
	
	ngOnInit() {
		this.loaded = false;
	}
	
	/**
	 * createClass
	 */
	public viewReceipt(collection) {
		this.router.navigate(['receipt']);
	}
	
	/**
	 * Check if the given tab is active tab
	 * @param tabName
	 * @returns {boolean}
	 */
	public getActiveTab() {
		return this.activeTab;
	}
	
	/**
	 * Set activeTab value
	 * @param value
	 */
	public setActiveTab(value) {
		this.activeTab = value;
	}
	
	
	/**
	 * calculate number of days of a class
	 */
	public getThisCollectionDate(collection) {
		if (collection.calendarId === undefined) {
			return ' ';
		} else {
			const joinedCalendar = collection.calendars.find((calendar) => {
				return calendar.id === collection.calendarId;
			});
			if (joinedCalendar) {
				return moment(joinedCalendar.startDate).format('Do MMM') + ' - ' + moment(joinedCalendar.endDate).format('Do MMM');
			} else {
				return null;
			}
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
	
	public getLatestCalendar(calendars) {
		return calendars.sort((a, b) => {
			if (a.startDate < b.startDate) {
				return -1;
			}
			if (a.startDate > b.startDate) {
				return 1;
			}
			return 0;
		})[0];
	}
	
	/**
	 * Get difference in days
	 */
	public getDaysBetween(startDate, endDate) {
		const a = moment(startDate);
		const b = moment(endDate);
		const diff = b.diff(a, 'days');
		switch (true) {
			case diff === 0:
				return 'today';
			case diff === 1:
				return 'yesterday';
			case diff > 1 && diff < 7:
				return diff + ' days ago';
			case diff >= 7 && diff < 30:
				return Math.floor(diff / 7) + ' weeks ago';
			case diff >= 30 && diff < 365:
				return Math.floor(diff / 30) + ' months ago';
			case diff >= 365:
				return Math.floor(diff / 365) + ' years ago';
			default:
				return diff + ' days ago';
		}
	}
	
	/**
	 * Get the most upcoming content details
	 */
	public getLearnerUpcomingEvent(collection) {
		const contents = collection.contents;
		const calendars = collection.calendars;
		if (contents && contents.length > 0) {
			let currentCalendar = this.getLearnerCalendar(collection);
			if (!currentCalendar) {
				currentCalendar = this.getLatestCalendar(calendars);
			}
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
	 * Get the progress bar value of this class
	 * @param class
	 * @returns {number}
	 */
	public getProgressValue(_class) {
		let max = 0;
		let progress = 0;
		_class.contents.forEach(content => {
			max++;
			switch (content.type) {
				case 'online':
					if (content.views && content.views.length > 0) {
						progress++;
					}
					break;
				
				case 'video':
					if (content.views && content.views.length > 0) {
						progress++;
					}
					break;
				
				case 'project':
					if (content.submissions && content.submissions.length > 0) {
						progress++;
					}
					break;
				
				case 'in-person':
					if (content.presence && content.presence.length > 0) {
						progress++;
					}
					break;
				
				default:
					break;
			}
		});
		return (progress / max) * 100;
	}
	
	public peerHasReview(collection) {
		return collection.reviews.some((review) => {
			return review.peer[0].id === this.userId;
		});
	}
	
	/**
	 * viewClass
	 */
	public viewClass(collection) {
		this.router.navigate(['class', collection.id]);
	}
	
	/**
	 * viewExperience
	 */
	public viewExperience(collection) {
		this.router.navigate(['experience', collection.id]);
	}
	
	/**
	 * viewCollection
	 */
	public viewCollection(collection) {
		this.router.navigate([collection.type, collection.id]);
	}
	
	/**
	 * viewSession
	 */
	public viewSession(collection) {
		this.router.navigate(['session', collection.id]);
	}
	
	
	imgErrorHandler(event) {
		event.target.src = '/assets/images/user-placeholder.jpg';
	}
	
	public generateKnowledgeStory() {
		this.router.navigate(['profile', this.userId, 'story']);
	}
	
}
