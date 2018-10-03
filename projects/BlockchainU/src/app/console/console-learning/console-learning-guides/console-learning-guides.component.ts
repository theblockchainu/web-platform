import { Component, OnInit } from '@angular/core';
import { ConsoleLearningComponent } from '../console-learning.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';
declare var moment: any;
import * as _ from 'lodash';

@Component({
    selector: 'app-console-learning-guides',
    templateUrl: './console-learning-guides.component.html',
    styleUrls: ['./console-learning-guides.component.scss', '../../console.component.scss']
})
export class ConsoleLearningGuidesComponent implements OnInit {

    public collections: any;
    public loaded: boolean;
    public now: Date;
    private outputResult: any;
    public activeTab: string;
    public userId;

    public ongoingArray: Array<any>;
    public upcomingArray: Array<any>;
    public pastArray: Array<any>;
    public pastGuideObject: any;
    public liveGuideObject: any;
    public upcomingGuideObject: any;

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
            console.log(urlSegment[0].path);
            consoleLearningComponent.setActiveTab(urlSegment[0].path);
        });
        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {
        this.loaded = false;
        this.fetchGuides();
    }

    private fetchGuides() {
        this._collectionService.getParticipatingCollections(this.userId, '{ "relInclude": "calendarId", "where": {"type":"guide"}, "include": ["calendars", {"owners":["profiles", "reviewsAboutYou", "ownedCollections"]}, {"participants": "profiles"}, "topics", {"contents":["schedules","views","submissions"]}, {"reviews":"peer"}] }', (err, result) => {
            if (err) {
                console.log(err);
            } else {
                this.ongoingArray = [];
                this.upcomingArray = [];
                this.pastArray = [];
                this.pastGuideObject = {};
                this.liveGuideObject = {};
                this.upcomingGuideObject = {};
                this.createOutput(result);
                this.now = new Date();
                this.loaded = true;
            }
        });
    }

    private createOutput(data: any) {
        const now = moment();
        data.forEach(guide => {
            guide.calendars.forEach(calendar => {
                if (calendar.endDate) {
                    if (now.diff(moment.utc(calendar.endDate)) < 0) {
                        if (!now.isBetween(calendar.startDate, calendar.endDate)) {
                            if (guide.id in this.upcomingGuideObject) {
                                this.upcomingGuideObject[guide.id]['guide']['calendars'].push(calendar);
                            } else {
                                this.upcomingGuideObject[guide.id] = {};
                                this.upcomingGuideObject[guide.id]['guide'] = _.clone(guide);
                                this.upcomingGuideObject[guide.id]['guide']['calendars'] = [calendar];
                            }
                        } else {
                            if (guide.id in this.liveGuideObject) {
                                this.liveGuideObject[guide.id]['guide']['calendars'].push(calendar);
                            } else {
                                this.liveGuideObject[guide.id] = {};
                                this.liveGuideObject[guide.id]['guide'] = _.clone(guide);
                                this.liveGuideObject[guide.id]['guide']['calendars'] = [calendar];
                            }
                        }

                    } else {
                        if (guide.id in this.pastGuideObject) {
                            this.pastGuideObject[guide.id]['guide']['calendars'].push(calendar);
                        } else {
                            this.pastGuideObject[guide.id] = {};
                            this.pastGuideObject[guide.id]['guide'] = guide;
                            this.pastGuideObject[guide.id]['guide']['calendars'] = [calendar];
                        }
                    }
                }
            });
        });
        for (const key in this.pastGuideObject) {
            if (this.pastGuideObject.hasOwnProperty(key)) {
                this.pastGuideObject[key].guide.calendars.sort((a, b) => {
                    return this.compareCalendars(a, b);
                });
                this.pastArray.push(this.pastGuideObject[key].guide);
            }
        }
        this.pastArray.sort((a, b) => {
            return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
        });
        for (const key in this.upcomingGuideObject) {
            if (this.upcomingGuideObject.hasOwnProperty(key)) {
                this.upcomingGuideObject[key].guide.calendars.sort((a, b) => {
                    return this.compareCalendars(a, b);
                });
                this.upcomingArray.push(this.upcomingGuideObject[key].guide);
            }
        }

        this.upcomingArray.sort((a, b) => {
            return moment(a.calendars[0].startDate).diff(moment(b.calendars[0].startDate), 'days');
        });

        for (const key in this.liveGuideObject) {
            if (this.liveGuideObject.hasOwnProperty(key)) {
                this.ongoingArray.push(this.liveGuideObject[key].guide);
            }
        }
    }

    public compareCalendars(a, b) {
        return moment(a.startDate).diff(moment(b.startDate), 'days');
    }
    public onSelect(collection) {
        this.router.navigate(['guide', collection.id, 'edit', 1]);
    }

    /**
      * exitGuides
      */
    public exitGuides(collection: any) {
        this._dialogService.openExitCollection(collection.id, this.userId, collection.type).subscribe((result: any) => {
            if (result) {
                this.fetchGuides();
                this.snackBar.open('You have dropped out of the ' + collection.type, 'Close', {
                    duration: 5000
                });
            } else {
                console.log(result);
            }
        });
    }


    public openCollection(collection: any) {
        this.router.navigateByUrl('/guide/' + collection.id + '/calendar/' + collection.calendarId);
    }

    public viewTransaction(collection: any) {
        this.router.navigate(['console', 'account', 'transactions']);
    }

    public openProfile(peer: any) {
        this.router.navigate(['profile', peer.id]);
    }

}
