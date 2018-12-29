import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CollectionService } from '../../../_services/collection/collection.service';
import { ConsoleTeachingComponent } from '../console-teaching.component';
import * as _ from 'lodash';
declare var moment: any;
import { MatDialog } from '@angular/material';
import { CohortDetailDialogComponent } from '../console-teaching-class/cohort-detail-dialog/cohort-detail-dialog.component';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';
import { UcFirstPipe } from 'ngx-pipes';
import { ProfileService } from '../../../_services/profile/profile.service';

@Component({
	selector: 'app-console-teaching-guide',
	templateUrl: './console-teaching-guide.component.html',
	styleUrls: ['./console-teaching-guide.component.scss', '../console-teaching.component.scss', '../../console.component.scss'],
	providers: [UcFirstPipe]
})
export class ConsoleTeachingGuideComponent implements OnInit {

	public collections: any;
	public loaded: boolean;
	public now: Date;
	public userId;
	public drafts: Array<any>;
	public ongoingArray: Array<any>;
	public upcomingArray: Array<any>;
	public pastArray: Array<any>;
	public pastGuidesObject: any;
	public liveGuidesObject: any;
	public upcomingGuidesObject: any;
	public accountVerified = false;
	public emailVerified = false;

	constructor(
		public activatedRoute: ActivatedRoute,
		public consoleTeachingComponent: ConsoleTeachingComponent,
		public _collectionService: CollectionService,
		private _cookieUtilsService: CookieUtilsService,
		public _dialogService: DialogsService,
		private _profileService: ProfileService,
		public router: Router,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private ucFirstPipe: UcFirstPipe
	) {
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			if (urlSegment[0] === undefined) {
				consoleTeachingComponent.setActiveTab('guides');
			} else {
				consoleTeachingComponent.setActiveTab(urlSegment[0].path);
			}
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}

	ngOnInit() {
		this.loaded = false;
		this.fetchData();
		this.accountVerified = (this._cookieUtilsService.getValue('accountApproved') === 'true');
	}

	private fetchData() {
		this._profileService.getPeerData(this.userId).subscribe(res => {
			this.emailVerified = res.emailVerified;
			if (!this.emailVerified) {
				this._dialogService.openOnboardingDialog(true).subscribe();
			}
		});

		this._collectionService.getOwnedCollections(this.userId,
			'{ "where": {"type":"guide"}, "include": ["calendars", "owners",' +
			' {"participants": ["reviewsAboutYou", "ownedCollections", "profiles"]}, "topics", ' +
			'{"contents":"schedules"}] }', (err, result) => {
				if (err) {
					console.log(err);
				} else {
					this.drafts = [];
					this.ongoingArray = [];
					this.upcomingArray = [];
					this.pastArray = [];
					this.pastGuidesObject = {};
					this.liveGuidesObject = {};
					this.upcomingGuidesObject = {};
					this.createOutput(result);
					this.now = new Date();
					this.loaded = true;
				}
			});
	}

	private createOutput(data: any) {
		const now = moment();
		data.forEach(guide => {
			if (guide.status === 'draft' || guide.status === 'submitted' || guide.calendars.length === 0) {
				guide.itenaries = [];
				this.drafts.push(guide);
			} else {
				guide.itenaries = this._collectionService.calculateItenaries(guide, guide.calendars[0]);
				console.log(guide);
				guide.calendars.forEach(calendar => {
					calendar.startDate = moment(calendar.startDate).toDate();
					calendar.endDate = moment(calendar.endDate).hours(23).minutes(59).toDate();
					const startDateMoment = moment(calendar.startDate).toDate();
					const endDateMoment = moment(calendar.endDate).hours(23).minutes(59).toDate();
					if (endDateMoment) {
						if (now.diff(endDateMoment) < 0) {
							if (!now.isBetween(startDateMoment, endDateMoment)) {
								if (guide.id in this.upcomingGuidesObject) {
									this.upcomingGuidesObject[guide.id]['guide']['calendars'].push(calendar);
								} else {
									this.upcomingGuidesObject[guide.id] = {};
									this.upcomingGuidesObject[guide.id]['guide'] = _.clone(guide);
									this.upcomingGuidesObject[guide.id]['guide']['calendars'] = [calendar];
								}
							} else {
								if (guide.id in this.liveGuidesObject) {
									this.liveGuidesObject[guide.id]['guide']['calendars'].push(calendar);
								} else {
									this.liveGuidesObject[guide.id] = {};
									this.liveGuidesObject[guide.id]['guide'] = _.clone(guide);
									this.liveGuidesObject[guide.id]['guide']['calendars'] = [calendar];
								}
							}

						} else {
							if (guide.id in this.pastGuidesObject) {
								this.pastGuidesObject[guide.id]['guide']['calendars'].push(calendar);
							} else {
								this.pastGuidesObject[guide.id] = {};
								this.pastGuidesObject[guide.id]['guide'] = guide;
								this.pastGuidesObject[guide.id]['guide']['calendars'] = [calendar];
								let participantReviewCount = 0;
								this.pastGuidesObject[guide.id]['guide'].participants.forEach(participant => {
									if (participant.reviewsAboutYou && participant.reviewsAboutYou.some(reviews => reviews.collectionId === guide.id)) {
										participantReviewCount += 1;
									}
								});
								this.pastGuidesObject[guide.id]['guide'].participantReviewCount = participantReviewCount;
							}
						}
					}
				});
			}
		});

		this.drafts.sort((a, b) => {
			return moment(b.updatedAt).diff(moment(a.updatedAt), 'days');
		});

		for (const key in this.pastGuidesObject) {
			if (this.pastGuidesObject.hasOwnProperty(key)) {
				this.pastGuidesObject[key].guide.calendars.sort((a, b) => {
					return this.compareCalendars(a, b);
				});
				this.pastArray.push(this.pastGuidesObject[key].guide);
			}
		}

		this.pastArray.sort((a, b) => {
			return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
		});

		for (const key in this.upcomingGuidesObject) {
			if (this.upcomingGuidesObject.hasOwnProperty(key)) {
				this.upcomingGuidesObject[key].guide.calendars.sort((a, b) => {
					return this.compareCalendars(a, b);
				});
				this.upcomingArray.push(this.upcomingGuidesObject[key].guide);
			}
		}

		this.upcomingArray.sort((a, b) => {
			return moment(a.calendars[0].startDate).diff(moment(b.calendars[0].startDate), 'days');
		});


		for (const key in this.liveGuidesObject) {
			if (this.liveGuidesObject.hasOwnProperty(key)) {
				this.ongoingArray.push(this.liveGuidesObject[key].guide);
			}
		}
	}

	public onSelect(guide) {
		this.router.navigate(['/guide/', guide.id, 'edit', guide.stage ? guide.stage : 1]);
	}

	public createGuide() {
		this._collectionService.postCollection(this.userId, 'guide').subscribe((guideObject: any) => {
			this.router.navigate(['guide', guideObject.id, 'edit', 1]);
		});
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

	/**
 * cloneCollection
 */
	public cloneCollection(collectionId: string) {
		this._collectionService.cloneCollection(collectionId)
			.subscribe(res => {
				this.fetchData();
				this.snackBar.open('Bounty Cloned', 'Close', { duration: 3000 });

			}, err => {
				console.log(err);
				this.snackBar.open('An error occured', 'Close', { duration: 3000 });
			});
	}

}
