import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleTeachingComponent } from '../console-teaching.component';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import * as _ from 'lodash';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { CohortDetailDialogComponent } from '../console-teaching-class/cohort-detail-dialog/cohort-detail-dialog.component';
declare var moment: any;
import { UcFirstPipe } from 'ngx-pipes';
import { ProfileService } from '../../../_services/profile/profile.service';
@Component({
	selector: 'app-console-teaching-all',
	templateUrl: './console-teaching-all.component.html',
	styleUrls: ['./console-teaching-all.component.scss', '../console-teaching.component.scss', '../../console.component.scss'],
	providers: [UcFirstPipe]
})
export class ConsoleTeachingAllComponent implements OnInit {

	public collections: any;
	public loaded: boolean;
	public now: Date;
	public userId;
	private outputResult: any;
	public activeTab: string;
	public drafts: Array<any>;
	public ongoingArray: Array<any>;
	public upcomingArray: Array<any>;
	public pastArray: Array<any>;
	public pastCollectionsObject: any;
	public liveCollectionsObject: any;
	public upcomingCollectionsObject: any;
	public accountVerified = false;
	public session: any;
	public profile: any;

	constructor(
		public activatedRoute: ActivatedRoute,
		public consoleTeachingComponent: ConsoleTeachingComponent,
		public router: Router,
		public _collectionService: CollectionService,
		public _dialogService: DialogsService,
		private _cookieUtilsService: CookieUtilsService,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private ucFirstPipe: UcFirstPipe,
		private profileService: ProfileService
	) {
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			if (urlSegment[0] === undefined) {
				consoleTeachingComponent.setActiveTab('all');
			} else {
				consoleTeachingComponent.setActiveTab(urlSegment[0].path);
			}
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}

	ngOnInit() {
		this.loaded = false;
		this.fetchData();
		this.getSessions();
		this.accountVerified = (this._cookieUtilsService.getValue('accountApproved') === 'true');
		this.getProfile();
	}

	private getProfile() {
		this.profileService.getProfileData(this.userId, {}).subscribe(res => {
			this.profile = res[0];
		});
	}

	public getSessions() {
		const option = {
			where: { type: 'session' }
		};
		this._collectionService.getOwnedCollections(this.userId, JSON.stringify(option), (err, res) => {
			if (res && res.length > 0) {
				this.session = res[0];
			}
		});
	}

	private fetchData() {
		const query = {
			include: [
				'calendars',
				'owners',
				{ 'participants': ['reviewsAboutYou', 'ownedCollections', 'profiles'] },
				'topics',
				{ 'contents': 'schedules' }
			],
			where: { type: { 'neq': 'session' } }
		};
		this._collectionService.getOwnedCollections(this.userId,
			JSON.stringify(query), (err, result) => {
				if (err) {
					console.log(err);
				} else {
					this.drafts = [];
					this.ongoingArray = [];
					this.upcomingArray = [];
					this.pastArray = [];
					this.pastCollectionsObject = {};
					this.liveCollectionsObject = {};
					this.upcomingCollectionsObject = {};
					this.createOutput(result);
					this.now = new Date();
					this.loaded = true;
				}
			});
	}

	private createOutput(data: any) {
		const now = moment();
		data.forEach(collection => {
			if (collection.status === 'draft' || collection.status === 'submitted' || collection.calendars.length === 0) {
				collection.itenaries = [];
				this.drafts.push(collection);
			} else {
				collection.itenaries = this._collectionService.calculateItenaries(collection, collection.calendars[0]);
				console.log(collection);
				collection.calendars.forEach(calendar => {
					calendar.startDate = moment(calendar.startDate).toDate();
					calendar.endDate = moment(calendar.endDate).hours(23).minutes(59).toDate();
					const startDateMoment = moment(calendar.startDate).toDate();
					const endDateMoment = moment(calendar.endDate).hours(23).minutes(59).toDate();
					if (endDateMoment) {
						if (now.diff(endDateMoment) < 0) {
							if (!now.isBetween(startDateMoment, endDateMoment)) {
								if (collection.id in this.upcomingCollectionsObject) {
									this.upcomingCollectionsObject[collection.id]['collection']['calendars'].push(calendar);
								} else {
									this.upcomingCollectionsObject[collection.id] = {};
									this.upcomingCollectionsObject[collection.id]['collection'] = _.clone(collection);
									this.upcomingCollectionsObject[collection.id]['collection']['calendars'] = [calendar];
								}
							} else {
								if (collection.id in this.liveCollectionsObject) {
									this.liveCollectionsObject[collection.id]['collection']['calendars'].push(calendar);
								} else {
									this.liveCollectionsObject[collection.id] = {};
									this.liveCollectionsObject[collection.id]['collection'] = _.clone(collection);
									this.liveCollectionsObject[collection.id]['collection']['calendars'] = [calendar];
								}
							}

						} else {
							if (collection.id in this.pastCollectionsObject) {
								this.pastCollectionsObject[collection.id]['collection']['calendars'].push(calendar);
							} else {
								this.pastCollectionsObject[collection.id] = {};
								this.pastCollectionsObject[collection.id]['collection'] = collection;
								this.pastCollectionsObject[collection.id]['collection']['calendars'] = [calendar];
								let participantReviewCount = 0;
								this.pastCollectionsObject[collection.id]['collection'].participants.forEach(participant => {
									if (participant.reviewsAboutYou && participant.reviewsAboutYou.some(reviews => reviews.collectionId === collection.id)) {
										participantReviewCount += 1;
									}
								});
								this.pastCollectionsObject[collection.id]['collection'].participantReviewCount = participantReviewCount;
							}
						}
					}
				});
			}
		});

		this.drafts.sort((a, b) => {
			return moment(b.updatedAt).diff(moment(a.updatedAt), 'days');
		});

		for (const key in this.pastCollectionsObject) {
			if (this.pastCollectionsObject.hasOwnProperty(key)) {
				this.pastCollectionsObject[key].collection.calendars.sort((a, b) => {
					return this.compareCalendars(a, b);
				});
				this.pastArray.push(this.pastCollectionsObject[key].collection);
			}
		}

		this.pastArray.sort((a, b) => {
			return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
		});

		for (const key in this.upcomingCollectionsObject) {
			if (this.upcomingCollectionsObject.hasOwnProperty(key)) {
				this.upcomingCollectionsObject[key].collection.calendars.sort((a, b) => {
					return this.compareCalendars(a, b);
				});
				this.upcomingArray.push(this.upcomingCollectionsObject[key].collection);
			}
		}

		this.upcomingArray.sort((a, b) => {
			return moment(a.calendars[0].startDate).diff(moment(b.calendars[0].startDate), 'days');
		});


		for (const key in this.liveCollectionsObject) {
			if (this.liveCollectionsObject.hasOwnProperty(key)) {
				this.ongoingArray.push(this.liveCollectionsObject[key].collection);
			}
		}
	}

	public onSelect(collection) {
		this.router.navigate([collection.type, collection.id, 'edit', collection.stage && collection.stage.length > 0 ? collection.stage : 1]);
	}

	/**
	 * compareCalendars
	 */
	public compareCalendars(a, b) {
		return moment(a.startDate).diff(moment(b.startDate), 'days');
	}

	public openCohortDetailDialog(cohortData: any, status) {
		cohortData['status'] = status;
		const dialogRef = this.dialog.open(CohortDetailDialogComponent, {
			width: '45vw',
			data: cohortData,
			panelClass: 'responsive-dialog',

		});
	}

	public createClass() {
		this._collectionService.postCollection(this.userId, 'class').subscribe((classObject: any) => {
			this.router.navigate(['class', classObject.id, 'edit', 1]);
		});
	}

	public createExperience() {
		this._collectionService.postCollection(this.userId, 'experience').subscribe((experienceObject: any) => {
			this.router.navigate(['experience', experienceObject.id, 'edit', 1]);
		});
	}

	public createGuide() {
		this._collectionService.postCollection(this.userId, 'guide').subscribe((guideObject: any) => {
			this.router.navigate(['guide', guideObject.id, 'edit', 1]);
		});
	}

	public deleteCollection(collection: any) {
		this._dialogService.openDeleteCollection(collection).subscribe((result: any) => {
			if (result) {
				this.fetchData();
				this.snackBar.open(this.ucFirstPipe.transform(collection.type) + ' Deleted', 'Close', {
					duration: 5000
				});
			}
		});
	}

	/**
	 * cancelCollection
	 collection:any     */
	public cancelCollection(collection: any) {
		this._dialogService.openCancelCollection(collection).subscribe((result: any) => {
			if (result) {
				this.fetchData();
				this.snackBar.open(this.ucFirstPipe.transform(collection.type) + ' Cancelled', 'Close', {
					duration: 5000
				});
			}
		});
	}

	public editSessions() {
		if (this.session) {
			this.router.navigateByUrl('/session/' + this.session.id + '/edit/' + 1);
		} else {
			const body = {
				type: 'session',
				title: (this.profile) ? this.profile.first_name + ' ' + this.profile.last_name : 'The Blockchain University User'
			};
			this._collectionService.postCollectionWithData(this.userId, body).subscribe((sessionObject: any) => {
				this.router.navigate(['session', sessionObject.id, 'edit', 1]);
			});
		}
	}

	public createAccreditation() {
		this._dialogService.createAccreditationDialog().subscribe(res => {
			this.router.navigateByUrl('/console/teaching/accreditations');
		});
	}
}
