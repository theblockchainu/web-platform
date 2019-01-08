import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { flatMap, map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ContentService } from '../../_services/content/content.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { CollectionService } from '../../_services/collection/collection.service';

@Component({
	selector: 'app-content-page',
	templateUrl: './content-page.component.html',
	styleUrls: ['./content-page.component.scss']
})
export class ContentPageComponent implements OnInit {
	
	contentId: string;
	data: any;
	userId: string;
	
	constructor(
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private contentService: ContentService,
		private _cookieUtils: CookieUtilsService,
		private _collectionService: CollectionService
	) { }
	
	ngOnInit() {
		console.log('content page');
		this.setUpVariables();
		this.loadPage();
	}
	
	loadPage() {
		this.activatedRoute.params
			.pipe(
				flatMap(params => {
					console.log('params', params);
					this.contentId = params['contentId'];
					return this.fetchContent();
				})
				, flatMap(content => {
					return this.parseContent(content);
				})
			).subscribe(data => {
			this.data = data;
			console.log(data);
		}, err => {
			console.log(err);
		});
	}
	setUpVariables() {
		this.contentId = null;
		this.data = null;
		this.userId = this._cookieUtils.getValue('userId');
	}
	
	fetchContent(): Observable<any> {
		const query = {
			include: [
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
				},
				{
					'collections': [
						'calendars',
						{
							'owners': [
								{ 'profiles': ['work'] }
							]
						},
						'rooms',
						'peersFollowing',
						{
							'assessment_models': [
								{ 'assessment_na_rules': { 'assessment_result': 'assessees' } },
								{ 'assessment_rules': { 'assessment_result': 'assessees' } }
							]
						}
					],
					'relInclude': 'calendarId'
				}
			]
		};
		return this.contentService.getContentById(this.contentId, query);
	}
	
	parseContent(contentInstance: any): Observable<any> {
		let data;
		let calendarId;
		const collection = contentInstance.collections[0];
		delete contentInstance.collections;
		const content = contentInstance;
		const filter = {
			'relInclude': ['calendarId', 'referrerId'],
			'include': ['profiles', 'reviewsAboutYou']
		};
		return this._collectionService.getParticipants(collection.id, filter)
			.pipe(
				map((participants: Array<any>) => {
					console.log(participants);
					let userType = 'public';
					let peerHasSubmission = false;
					const participant = participants.find((participantElement) => participantElement.id === this.userId);
					if (participant) {
						userType = 'participant';
						if (contentInstance.submissions && contentInstance.submissions.length > 0) {
							contentInstance.submissions.some(submission => {
								if (submission.peer) {
									if (this.userId === submission.peer[0].id) {
										peerHasSubmission = true;
										return true;
									}
								}
							});
						}
						calendarId = participant.calendarId;
					}
					if (!participant) {
						const owner = collection.owners.find((ownerElement) => ownerElement.id === this.userId);
						if (owner) {
							userType = 'owner';
						}
					}
					const calendars = <Array<any>>collection.calendars;
					const currentCalendar = calendarId ? calendars.find((calendar) => calendar.id = calendarId) : calendars[0];
					let startDate, endDate;
					if (currentCalendar) {
						startDate = this._collectionService.calculateDate(currentCalendar.startDate, contentInstance.schedules[0].startDay);
						endDate = this._collectionService.calculateDate(currentCalendar.startDate, contentInstance.schedules[0].endDay);
					} else {
						startDate = this._collectionService.calculateDate(collection.calendars[0].startDate, contentInstance.schedules[0].startDay);
						endDate = this._collectionService.calculateDate(collection.calendars[0].startDate, contentInstance.schedules[0].endDay);
					}
					console.log('content type ' + content.type);
					
					switch (content.type) {
						case 'in-person':
							data = {
								content: content,
								startDate: startDate,
								endDate: endDate,
								userType: userType,
								collectionId: collection.id,
								collection: collection,
								calendarId: calendarId,
								participants: participants
							};
							break;
						case 'quiz':
							data = {
								content: content,
								startDate: startDate,
								endDate: endDate,
								userType: userType,
								collectionId: collection.id,
								collection: collection,
								calendarId: calendarId,
								participants: participants
							};
							break;
						case 'video':
							data = {
								content: content,
								startDate: startDate,
								endDate: endDate,
								userType: userType,
								collectionId: collection.id,
								collection: collection,
								calendarId: calendarId
							};
							break;
						case 'project':
							data = {
								content: content,
								startDate: startDate,
								endDate: endDate,
								userType: userType,
								peerHasSubmission: peerHasSubmission,
								collectionId: collection.id,
								collection: collection,
								calendarId: calendarId
							};
							break;
						case 'online':
							data = {
								content: content,
								startDate: startDate,
								endDate: endDate,
								userType: userType,
								collectionId: collection.id,
								collection: collection,
								calendarId: calendarId
							};
							break;
						default:
							break;
					}
					return data;
				}));
		
	}
	
	exitDialog(event) {
		console.log(event);
		this.loadPage();
	}
	
}
