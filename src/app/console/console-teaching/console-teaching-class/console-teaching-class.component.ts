import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CollectionService } from '../../../_services/collection/collection.service';
import { ConsoleTeachingComponent } from '../console-teaching.component';
import * as _ from 'lodash';
declare var moment: any;
import { MatDialog } from '@angular/material';
import { CohortDetailDialogComponent } from './cohort-detail-dialog/cohort-detail-dialog.component';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';
import { UcFirstPipe } from 'ngx-pipes';

@Component({
	selector: 'app-console-teaching-class',
	templateUrl: './console-teaching-class.component.html',
	styleUrls: ['./console-teaching-class.component.scss', '../console-teaching.component.scss', '../../console.component.scss'],
	providers: [UcFirstPipe]
})
export class ConsoleTeachingClassComponent implements OnInit {
	
	public collections: any;
	public loaded: boolean;
	public now: Date;
	public userId;
	public drafts: Array<any>;
	public ongoingArray: Array<any>;
	public upcomingArray: Array<any>;
	public pastArray: Array<any>;
	public pastClassesObject: any;
	public liveClassesObject: any;
	public upcomingClassesObject: any;
	
	constructor(
		public activatedRoute: ActivatedRoute,
		public consoleTeachingComponent: ConsoleTeachingComponent,
		public _collectionService: CollectionService,
		private _cookieUtilsService: CookieUtilsService,
		private _dialogService: DialogsService,
		public router: Router,
		public dialog: MatDialog,
		public snackBar: MatSnackBar,
		private ucFirstPipe: UcFirstPipe
	) {
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			if (urlSegment[0] === undefined) {
				consoleTeachingComponent.setActiveTab('classes');
			} else {
				consoleTeachingComponent.setActiveTab(urlSegment[0].path);
			}
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.loaded = false;
		this.fetchData();
	}
	
	private fetchData() {
		this._collectionService.getOwnedCollections(this.userId, '{ "where": {"type":"class"}, "include": ["calendars", "owners", {"participants": ["reviewsAboutYou", "ownedCollections", "profiles"]}, "topics", {"contents":"schedules"}] }', (err, result) => {
			if (err) {
				console.log(err);
			} else {
				this.drafts = [];
				this.ongoingArray = [];
				this.upcomingArray = [];
				this.pastArray = [];
				this.pastClassesObject = {};
				this.liveClassesObject = {};
				this.upcomingClassesObject = {};
				this.createOutput(result);
				this.now = new Date();
				this.loaded = true;
			}
		});
	}
	
	private createOutput(data: any) {
		const now = moment();
		data.forEach(_class => {
			if (_class.status === 'draft' || _class.status === 'submitted' || _class.calendars.length === 0) {
				_class.itenaries = [];
				this.drafts.push(_class);
			} else {
				_class.itenaries = this._collectionService.calculateItenaries(_class, _class.calendars[0]);
				console.log(_class);
				_class.calendars.forEach(calendar => {
					calendar.startDate = moment(calendar.startDate).toDate();
					calendar.endDate = moment(calendar.endDate).hours(23).minutes(59).toDate();
					const startDateMoment = moment(calendar.startDate).toDate();
					const endDateMoment = moment(calendar.endDate).hours(23).minutes(59).toDate();
					if (endDateMoment) {
						if (now.diff(endDateMoment) < 0) {
							if (!now.isBetween(startDateMoment, endDateMoment)) {
								if (_class.id in this.upcomingClassesObject) {
									this.upcomingClassesObject[_class.id]['class']['calendars'].push(calendar);
								} else {
									this.upcomingClassesObject[_class.id] = {};
									this.upcomingClassesObject[_class.id]['class'] = _.clone(_class);
									this.upcomingClassesObject[_class.id]['class']['calendars'] = [calendar];
								}
							} else {
								if (_class.id in this.liveClassesObject) {
									this.liveClassesObject[_class.id]['class']['calendars'].push(calendar);
								} else {
									this.liveClassesObject[_class.id] = {};
									this.liveClassesObject[_class.id]['class'] = _.clone(_class);
									this.liveClassesObject[_class.id]['class']['calendars'] = [calendar];
								}
							}
							
						} else {
							if (_class.id in this.pastClassesObject) {
								this.pastClassesObject[_class.id]['class']['calendars'].push(calendar);
							} else {
								this.pastClassesObject[_class.id] = {};
								this.pastClassesObject[_class.id]['class'] = _class;
								this.pastClassesObject[_class.id]['class']['calendars'] = [calendar];
								let participantReviewCount = 0;
								this.pastClassesObject[_class.id]['class'].participants.forEach(participant => {
									if (participant.reviewsAboutYou && participant.reviewsAboutYou.some(reviews => reviews.collectionId === _class.id)) {
										participantReviewCount += 1;
									}
								});
								this.pastClassesObject[_class.id]['class'].participantReviewCount = participantReviewCount;
							}
						}
					}
				});
			}
		});
		
		this.drafts.sort((a, b) => {
			return moment(b.updatedAt).diff(moment(a.updatedAt), 'days');
		});
		
		for (const key in this.pastClassesObject) {
			if (this.pastClassesObject.hasOwnProperty(key)) {
				this.pastClassesObject[key].class.calendars.sort((a, b) => {
					return this.compareCalendars(a, b);
				});
				this.pastArray.push(this.pastClassesObject[key].class);
			}
		}
		
		this.pastArray.sort((a, b) => {
			return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
		});
		
		for (const key in this.upcomingClassesObject) {
			if (this.upcomingClassesObject.hasOwnProperty(key)) {
				this.upcomingClassesObject[key].class.calendars.sort((a, b) => {
					return this.compareCalendars(a, b);
				});
				this.upcomingArray.push(this.upcomingClassesObject[key].class);
			}
		}
		
		this.upcomingArray.sort((a, b) => {
			return moment(a.calendars[0].startDate).diff(moment(b.calendars[0].startDate), 'days');
		});
		
		
		for (const key in this.liveClassesObject) {
			if (this.liveClassesObject.hasOwnProperty(key)) {
				this.ongoingArray.push(this.liveClassesObject[key].class);
			}
		}
	}
	
	public onSelect(_class) {
	this.router.navigate(['/class/', _class.id, 'edit', _class.stage ? _class.stage : 1]);
}

public createClass() {
	this._collectionService.postCollection(this.userId, 'class').subscribe((classObject: any) => {
		this.router.navigate(['class', classObject.id, 'edit', 1]);
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
	this._dialogService.openDeleteCollection(collection).subscribe(result => {
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
	this._dialogService.openCancelCollection(collection).subscribe(result => {
		if (result) {
			this.fetchData();
			this.snackBar.open(this.ucFirstPipe.transform(collection.type) + ' Cancelled', 'Close', {
				duration: 5000
			});
		}
	});
}

}
