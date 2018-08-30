import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleProfileComponent } from '../console-profile.component';
import { ProfileService } from '../../../_services/profile/profile.service';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import * as moment from 'moment';
import { ChangeDetectorRef } from '@angular/core';

@Component({
	selector: 'app-console-profile-reviews',
	templateUrl: './console-profile-reviews.component.html',
	styleUrls: ['./console-profile-reviews.component.scss', '../console-profile.component.scss', '../../console.component.scss']
})
export class ConsoleProfileReviewsComponent implements OnInit, AfterViewChecked {
	
	public userId;
	public loading: boolean;
	public profile: any;
	public now: Date;
	public completeCollections: any;
	public completeArray: Array<any>;
	public pendingReviewCollections: Array<any>;
	
	constructor(
		public activatedRoute: ActivatedRoute,
		public consoleProfileComponent: ConsoleProfileComponent,
		public router: Router,
		public _profileService: ProfileService,
		public _collectionService: CollectionService,
		private _cookieUtilsService: CookieUtilsService,
		private _cdRef: ChangeDetectorRef,
		private dialogsService: DialogsService
	) {
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			consoleProfileComponent.setActiveTab(urlSegment[0].path);
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.loading = true;
		this._profileService.getProfile(this.userId).subscribe((profiles) => {
			this.completeCollections = {};
			this.completeArray = [];
			this.pendingReviewCollections = [];
			this.profile = profiles[0];
			if (this.profile && this.profile.peer) {
				this.pendingReviewCollections = this.getPendingReviewCollections(this.profile.peer[0]);
			}
			this.loading = false;
		});
	}
	
	ngAfterViewChecked() {
	
	}
	
	/**
	 * Find the collection object for a particular collection ID
	 * @param peer
	 * @param collectionId
	 */
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
	
	/**
	 * Find the collection object for a particular collection ID
	 * @param calendars
	 * @param calendarId
	 */
	public getReviewedCalendar(calendars, calendarId) {
		return calendars.find((calendar) => {
			return calendar.id === calendarId;
		}) !== undefined ? calendars.find((calendar) => {
			return calendar.id === calendarId;
		}) : {};
	}
	
	/**
	 * Check if given peer is a teacher
	 * @param peer
	 * @returns {boolean}
	 */
	public isTeacher(peer) {
		return peer.ownedCollections !== undefined && peer.ownedCollections.length > 0;
	}
	
	/**
	 * Get the list of all collections pending a review to be given to student
	 * @param peer
	 * @param reviewsByYou
	 * @returns {any[]}
	 */
	public getPendingReviewCollections(peer) {
		const now = moment();
		let pendingReviewCollections: any[] = [];
		if (!this.isTeacher(peer)) {
			pendingReviewCollections = undefined;
		} else {
			peer.ownedCollections.forEach(collection => {
				if (collection.status !== 'draft' && collection.status !== 'submitted' && collection.calendars && collection.contents) {
					collection.itenaries = this._collectionService.calculateItenaries(collection, collection.calendars[0]);
					collection.calendars.forEach(calendar => {
						calendar.startDate = moment(calendar.startDate).toDate();
						calendar.endDate = moment(calendar.endDate).hours(23).minutes(59).toDate();
						const startDateMoment = moment(calendar.startDate).toDate();
						const endDateMoment = moment(calendar.endDate).hours(23).minutes(59).toDate();
						if (endDateMoment) {
							if (now.diff(endDateMoment) > 0) {
								if (collection.id in this.completeCollections) {
									this.completeCollections[collection.id]['collection']['calendars'].push(calendar);
								} else {
									this.completeCollections[collection.id] = {};
									this.completeCollections[collection.id]['collection'] = collection;
									this.completeCollections[collection.id]['collection']['calendars'] = [calendar];
									let participantReviewCount = 0;
									if (this.completeCollections[collection.id]['collection'].participants !== undefined) {
										this.completeCollections[collection.id]['collection'].participants.forEach(participant => {
											if (participant.reviewsAboutYou && participant.reviewsAboutYou[0].collectionId === collection.id) {
												participantReviewCount += 1;
											}
										});
									}
									this.completeCollections[collection.id]['collection'].participantReviewCount = participantReviewCount;
								}
							}
						}
					});
				}
			});
			for (const key in this.completeCollections) {
				if (this.completeCollections.hasOwnProperty(key)) {
					this.completeCollections[key].collection.calendars.sort((a, b) => {
						return this.compareCalendars(a, b);
					});
					this.completeArray.push(this.completeCollections[key].collection);
				}
			}
			
			this.completeArray.sort((a, b) => {
				return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
			});
			
			
			if (this.completeArray) {
				this.completeArray.forEach(collection => {
					let hasPending = false;
					let pendingReviewParticipantCount = 0;
					if (collection.participants !== undefined) {
						collection.participants.forEach(participant => {
							// If one of the participant of a collection does not have a review
							if (peer.reviewsByYou === undefined || !peer.reviewsByYou.some(review => {
								return review.collectionId === collection.id && review.reviewedPeer[0].id === participant.id;
							})) {
								hasPending = true;
								pendingReviewParticipantCount++;
							}
						});
					}
					if (hasPending) {
						collection.pendingReviewParticipantCount = pendingReviewParticipantCount;
						pendingReviewCollections.push(collection);
					}
				});
			}
		}
		console.log('pending collections: ');
		console.log(pendingReviewCollections);
		return pendingReviewCollections;
	}
	
	/**
	 * compareCalendars
	 */
	public compareCalendars(a, b) {
		return moment(a.startDate).diff(moment(b.startDate), 'days');
	}
	
	
	/**
	 * Show popup to rate students
	 */
	public showRateStudentsPopup(collection) {
		// Show popup here
		const data = collection;
		this.dialogsService.rateParticipant(data)
			.subscribe();
	}
	
}
