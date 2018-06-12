import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleLearningComponent } from '../console-learning.component';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';

declare var moment: any;
import * as _ from 'lodash';


@Component({
	selector: 'app-console-learning-classes',
	templateUrl: './console-learning-classes.component.html',
	styleUrls: ['./console-learning-classes.component.scss', '../../console.component.scss']
})
export class ConsoleLearningClassesComponent implements OnInit {
	
	public collections: any;
	public loaded: boolean;
	public now: Date;
	private outputResult: any;
	public activeTab: string;
	public userId;
	
	public ongoingArray: Array<any>;
	public upcomingArray: Array<any>;
	public pastArray: Array<any>;
	public pastClassesObject: any;
	public liveClassesObject: any;
	public upcomingClassesObject: any;
	
	
	constructor(
		public activatedRoute: ActivatedRoute,
		public consoleLearningComponent: ConsoleLearningComponent,
		public _collectionService: CollectionService,
		public router: Router,
		private _cookieUtilsService: CookieUtilsService,
		private _dialogService: DialogsService,
		public snackBar: MatSnackBar
	) {
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			if (urlSegment[0] === undefined) {
				consoleLearningComponent.setActiveTab('classes');
			} else {
				console.log(urlSegment[0].path);
				consoleLearningComponent.setActiveTab(urlSegment[0].path);
			}
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.loaded = false;
		this.fetchClass();
	}
	
	private fetchClass() {
		this._collectionService.getParticipatingCollections(this.userId, '{ "relInclude": "calendarId", "where": {"type":"class"}, "include": ["calendars", {"owners":["profiles", "reviewsAboutYou", "ownedCollections"]}, {"participants": "profiles"}, "topics", {"contents":["schedules","views","submissions"]}, {"reviews":"peer"}] }', (err, result) => {
			if (err) {
				console.log(err);
			} else {
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
			_class.calendars.forEach(calendar => {
				if (_class.calendarId === calendar.id && calendar.endDate) {
					if (now.diff(moment.utc(calendar.endDate)) < 0) {
						if (!now.isBetween(calendar.startDate, calendar.endDate)) {
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
						}
					}
				}
			});
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
	
	public compareCalendars(a, b) {
		return moment(a.startDate).diff(moment(b.startDate), 'days');
	}
	public onSelect(_class) {
	this.router.navigate(['class', _class.id, 'edit', 1]);
}

public exitClass(collection: any) {
	this._dialogService.openExitCollection(collection.id, this.userId).subscribe(result => {
		if (result) {
			this.fetchClass();
			this.snackBar.open('You have dropped out of the ' + collection.type, 'Close', {
				duration: 5000
			});
		} else {
			console.log(result);
		}
	});
}
public openCollection(collection: any) {
	this.router.navigateByUrl('/class/' + collection.id + '/calendar/' + collection.calendarId);
}

public viewTransaction(collection: any) {
	this.router.navigate(['console', 'account', 'transactions']);
}

public openProfile(peer: any) {
	this.router.navigate(['profile', peer.id]);
}

}
