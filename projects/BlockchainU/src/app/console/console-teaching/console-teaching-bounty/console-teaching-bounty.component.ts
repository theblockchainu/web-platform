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
	selector: 'app-console-teaching-bounty',
	templateUrl: './console-teaching-bounty.component.html',
	styleUrls: ['./console-teaching-bounty.component.scss', '../console-teaching.component.scss', '../../console.component.scss'],
	providers: [UcFirstPipe]
})
export class ConsoleTeachingBountyComponent implements OnInit {

	public collections: any;
	public loaded: boolean;
	public now: Date;
	public userId;
	public drafts: Array<any>;
	public ongoingArray: Array<any>;
	public upcomingArray: Array<any>;
	public pastArray: Array<any>;
	public pastBountiesObject: any;
	public liveBountiesObject: any;
	public upcomingBountiesObject: any;
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
				consoleTeachingComponent.setActiveTab('bounties');
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
			'{ "where": {"type":"bounty"}, "include": ["calendars", "owners",' +
			' {"participants": ["reviewsAboutYou", "ownedCollections", "profiles"]}, "topics", ' +
			'{"contents":"schedules"}] }', (err, result) => {
				if (err) {
					console.log(err);
				} else {
					this.drafts = [];
					this.ongoingArray = [];
					this.upcomingArray = [];
					this.pastArray = [];
					this.pastBountiesObject = {};
					this.liveBountiesObject = {};
					this.upcomingBountiesObject = {};
					this.createOutput(result);
					this.now = new Date();
					this.loaded = true;
				}
			});
	}

	private createOutput(data: any) {
		const now = moment();
		data.forEach(bounty => {
			if (bounty.status === 'draft' || bounty.status === 'submitted' || bounty.calendars.length === 0) {
				bounty.itenaries = [];
				this.drafts.push(bounty);
			} else {
				bounty.itenaries = this._collectionService.calculateItenaries(bounty, bounty.calendars[0]);
				console.log(bounty);
				bounty.calendars.forEach(calendar => {
					calendar.startDate = moment(calendar.startDate).toDate();
					calendar.endDate = moment(calendar.endDate).hours(23).minutes(59).toDate();
					const startDateMoment = moment(calendar.startDate).toDate();
					const endDateMoment = moment(calendar.endDate).hours(23).minutes(59).toDate();
					if (endDateMoment) {
						if (now.diff(endDateMoment) < 0) {
							if (!now.isBetween(startDateMoment, endDateMoment)) {
								if (bounty.id in this.upcomingBountiesObject) {
									this.upcomingBountiesObject[bounty.id]['bounty']['calendars'].push(calendar);
								} else {
									this.upcomingBountiesObject[bounty.id] = {};
									this.upcomingBountiesObject[bounty.id]['bounty'] = _.clone(bounty);
									this.upcomingBountiesObject[bounty.id]['bounty']['calendars'] = [calendar];
								}
							} else {
								if (bounty.id in this.liveBountiesObject) {
									this.liveBountiesObject[bounty.id]['bounty']['calendars'].push(calendar);
								} else {
									this.liveBountiesObject[bounty.id] = {};
									this.liveBountiesObject[bounty.id]['bounty'] = _.clone(bounty);
									this.liveBountiesObject[bounty.id]['bounty']['calendars'] = [calendar];
								}
							}

						} else {
							if (bounty.id in this.pastBountiesObject) {
								this.pastBountiesObject[bounty.id]['bounty']['calendars'].push(calendar);
							} else {
								this.pastBountiesObject[bounty.id] = {};
								this.pastBountiesObject[bounty.id]['bounty'] = bounty;
								this.pastBountiesObject[bounty.id]['bounty']['calendars'] = [calendar];
								let participantReviewCount = 0;
								this.pastBountiesObject[bounty.id]['bounty'].participants.forEach(participant => {
									if (participant.reviewsAboutYou && participant.reviewsAboutYou.some(reviews => reviews.collectionId === bounty.id)) {
										participantReviewCount += 1;
									}
								});
								this.pastBountiesObject[bounty.id]['bounty'].participantReviewCount = participantReviewCount;
							}
						}
					}
				});
			}
		});

		this.drafts.sort((a, b) => {
			return moment(b.updatedAt).diff(moment(a.updatedAt), 'days');
		});

		for (const key in this.pastBountiesObject) {
			if (this.pastBountiesObject.hasOwnProperty(key)) {
				this.pastBountiesObject[key].bounty.calendars.sort((a, b) => {
					return this.compareCalendars(a, b);
				});
				this.pastArray.push(this.pastBountiesObject[key].bounty);
			}
		}

		this.pastArray.sort((a, b) => {
			return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
		});

		for (const key in this.upcomingBountiesObject) {
			if (this.upcomingBountiesObject.hasOwnProperty(key)) {
				this.upcomingBountiesObject[key].bounty.calendars.sort((a, b) => {
					return this.compareCalendars(a, b);
				});
				this.upcomingArray.push(this.upcomingBountiesObject[key].bounty);
			}
		}

		this.upcomingArray.sort((a, b) => {
			return moment(a.calendars[0].startDate).diff(moment(b.calendars[0].startDate), 'days');
		});


		for (const key in this.liveBountiesObject) {
			if (this.liveBountiesObject.hasOwnProperty(key)) {
				this.ongoingArray.push(this.liveBountiesObject[key].bounty);
			}
		}
	}

	public onSelect(bounty) {
		this.router.navigate(['/bounty/', bounty.id, 'edit', bounty.stage ? bounty.stage : 1]);
	}

	public createBounty() {
		this._collectionService.postCollection(this.userId, 'bounty').subscribe((bountyObject: any) => {
			this.router.navigate(['bounty', bountyObject.id, 'edit', 1]);
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

}
