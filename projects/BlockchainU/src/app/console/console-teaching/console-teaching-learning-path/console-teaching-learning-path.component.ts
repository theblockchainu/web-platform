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
	selector: 'app-console-teaching-learning-path',
	templateUrl: './console-teaching-learning-path.component.html',
	styleUrls: ['./console-teaching-learning-path.component.scss', '../console-teaching.component.scss', '../../console.component.scss'],
	providers: [UcFirstPipe]
})
export class ConsoleTeachingLearningPathComponent implements OnInit {

	public collections: any;
	public loaded: boolean;
	public now: Date;
	public userId;
	public drafts: Array<any>;
	public ongoingArray: Array<any>;
	public upcomingArray: Array<any>;
	public pastArray: Array<any>;
	public pastLearningPathsObject: any;
	public liveLearningPathsObject: any;
	public upcomingLearningPathsObject: any;
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
				consoleTeachingComponent.setActiveTab('learning-paths');
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
			'{ "where": {"type":"learningPath"}, "include": ["calendars", "owners",' +
			' {"participants": ["reviewsAboutYou", "ownedCollections", "profiles"]}, "topics", ' +
			'{"contents":"schedules"}] }', (err, result) => {
				if (err) {
					console.log(err);
				} else {
					this.drafts = [];
					this.ongoingArray = [];
					this.upcomingArray = [];
					this.pastArray = [];
					this.pastLearningPathsObject = {};
					this.liveLearningPathsObject = {};
					this.upcomingLearningPathsObject = {};
					this.createOutput(result);
					this.now = new Date();
					this.loaded = true;
				}
			});
	}

	private createOutput(data: any) {
		const now = moment();
		data.forEach(learningPath => {
			if (learningPath.status === 'draft' || learningPath.status === 'submitted' || learningPath.calendars.length === 0) {
				learningPath.itenaries = [];
				this.drafts.push(learningPath);
			} else {
				learningPath.itenaries = this._collectionService.calculateItenaries(learningPath, learningPath.calendars[0]);
				console.log(learningPath);
				learningPath.calendars.forEach(calendar => {
					calendar.startDate = moment(calendar.startDate).toDate();
					calendar.endDate = moment(calendar.endDate).hours(23).minutes(59).toDate();
					const startDateMoment = moment(calendar.startDate).toDate();
					const endDateMoment = moment(calendar.endDate).hours(23).minutes(59).toDate();
					if (endDateMoment) {
						if (now.diff(endDateMoment) < 0) {
							if (!now.isBetween(startDateMoment, endDateMoment)) {
								if (learningPath.id in this.upcomingLearningPathsObject) {
									this.upcomingLearningPathsObject[learningPath.id]['learningPath']['calendars'].push(calendar);
								} else {
									this.upcomingLearningPathsObject[learningPath.id] = {};
									this.upcomingLearningPathsObject[learningPath.id]['learningPath'] = _.clone(learningPath);
									this.upcomingLearningPathsObject[learningPath.id]['learningPath']['calendars'] = [calendar];
								}
							} else {
								if (learningPath.id in this.liveLearningPathsObject) {
									this.liveLearningPathsObject[learningPath.id]['learningPath']['calendars'].push(calendar);
								} else {
									this.liveLearningPathsObject[learningPath.id] = {};
									this.liveLearningPathsObject[learningPath.id]['learningPath'] = _.clone(learningPath);
									this.liveLearningPathsObject[learningPath.id]['learningPath']['calendars'] = [calendar];
								}
							}

						} else {
							if (learningPath.id in this.pastLearningPathsObject) {
								this.pastLearningPathsObject[learningPath.id]['learningPath']['calendars'].push(calendar);
							} else {
								this.pastLearningPathsObject[learningPath.id] = {};
								this.pastLearningPathsObject[learningPath.id]['learningPath'] = learningPath;
								this.pastLearningPathsObject[learningPath.id]['learningPath']['calendars'] = [calendar];
								let participantReviewCount = 0;
								this.pastLearningPathsObject[learningPath.id]['learningPath'].participants.forEach(participant => {
									if (participant.reviewsAboutYou && participant.reviewsAboutYou.some(reviews => reviews.collectionId === learningPath.id)) {
										participantReviewCount += 1;
									}
								});
								this.pastLearningPathsObject[learningPath.id]['learningPath'].participantReviewCount = participantReviewCount;
							}
						}
					}
				});
			}
		});

		this.drafts.sort((a, b) => {
			return moment(b.updatedAt).diff(moment(a.updatedAt), 'days');
		});

		for (const key in this.pastLearningPathsObject) {
			if (this.pastLearningPathsObject.hasOwnProperty(key)) {
				this.pastLearningPathsObject[key].learningPath.calendars.sort((a, b) => {
					return this.compareCalendars(a, b);
				});
				this.pastArray.push(this.pastLearningPathsObject[key].learningPath);
			}
		}

		this.pastArray.sort((a, b) => {
			return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
		});

		for (const key in this.upcomingLearningPathsObject) {
			if (this.upcomingLearningPathsObject.hasOwnProperty(key)) {
				this.upcomingLearningPathsObject[key].learningPath.calendars.sort((a, b) => {
					return this.compareCalendars(a, b);
				});
				this.upcomingArray.push(this.upcomingLearningPathsObject[key].learningPath);
			}
		}

		this.upcomingArray.sort((a, b) => {
			return moment(a.calendars[0].startDate).diff(moment(b.calendars[0].startDate), 'days');
		});


		for (const key in this.liveLearningPathsObject) {
			if (this.liveLearningPathsObject.hasOwnProperty(key)) {
				this.ongoingArray.push(this.liveLearningPathsObject[key].learningPath);
			}
		}
	}

	public onSelect(learningPath) {
		this.router.navigate(['/learning-path/', learningPath.id, 'edit', learningPath.stage ? learningPath.stage : 1]);
	}

	public createLearningPath() {
		this._collectionService.postCollection(this.userId, 'learningPath').subscribe((learningPathObject: any) => {
			this.router.navigate(['learning-path', learningPathObject.id, 'edit', 1]);
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
