import {Component, OnInit} from '@angular/core';
import {CommunityPageComponent} from '../community-page.component';
import {ActivatedRoute} from '@angular/router';
import {CollectionService} from '../../../_services/collection/collection.service';
import {CookieUtilsService} from '../../../_services/cookieUtils/cookie-utils.service';
import {CommunityService} from '../../../_services/community/community.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import {DialogsService} from '../../../_services/dialogs/dialog.service';
import {environment} from '../../../../environments/environment';

@Component({
	selector: 'app-community-page-classes',
	templateUrl: './community-page-classes.component.html',
	styleUrls: ['./community-page-classes.component.scss']
})
export class CommunityPageClassesComponent implements OnInit {
	
	public ownedClasses;
	public userId;
	public communityId;
	public classes;
	private today = moment();
	public loadingClasses = true;
	public envVariable;
	
	constructor(public activatedRoute: ActivatedRoute,
				public communityPageComponent: CommunityPageComponent,
				public _collectionService: CollectionService,
				public _communityService: CommunityService,
				public _dialogsService: DialogsService,
				public _cookieUtilsService: CookieUtilsService) {
		this.envVariable = environment;
		activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
			console.log('activated route is: ' + JSON.stringify(urlSegment));
			if (urlSegment[0] === undefined) {
				this.communityId = '';
			} else {
				this.communityId = urlSegment[0].path;
			}
		});
		this.activatedRoute.pathFromRoot[5].url.subscribe((urlSegment) => {
			console.log('activated route is: ' + JSON.stringify(urlSegment));
			if (urlSegment[0] === undefined) {
				this._communityService.setActiveTab('classes');
			} else {
				this._communityService.setActiveTab(urlSegment[0].path);
			}
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.getClasses();
		this.getCollections();
	}
	
	public getClasses() {
		this._collectionService.getOwnedCollections(this.userId, JSON.stringify({'where': {'and': [{'status': 'active'}, {'type': 'class'}]}}), (err, res) => {
			if (err) {
				console.log(err);
			} else {
				this.ownedClasses = res;
			}
		});
	}
	
	public getCollections() {
		this.loadingClasses = true;
		const query = {
			'include': [
				{ 'owners': ['reviewsAboutYou', 'profiles'] },
				'calendars',
				'participants',
				{ 'bookmarks': 'peer' },
				{ 'contents' : ['schedules', 'locations' ]}
			],
			'where': { 'type': 'class' }
		};
		this._communityService.getCollections(this.communityId, query, (err, res) => {
			if (err) {
				console.log(err);
			} else {
				const classes = [];
				res.forEach(collection => {
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
								if (moment(calendar.startDate).diff(this.today, 'days') >= -1) {
									hasActiveCalendar = true;
									return;
								}
							});
						}
						if (hasActiveCalendar) {
							classes.push(collection);
						}
					}
				});
				this.classes = _.uniqBy(classes, 'id');
				this.loadingClasses = false;
			}
		});
	}
	
	public addClass(classId) {
		console.log(classId);
		if (classId !== null && classId.length > 0) {
			this._collectionService.linkCommunityToCollection(this.communityId, classId, (err: any, response: any) => {
				if (err) {
					console.log(err);
				} else {
					this.getCollections();
				}
			});
		}
	}
	
	public onClassRefresh(event) {
		if (event) {
			this.getCollections();
		}
	}
	
}
