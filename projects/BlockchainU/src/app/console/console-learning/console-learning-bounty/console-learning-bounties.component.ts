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
    selector: 'app-console-learning-bounties',
    templateUrl: './console-learning-bounties.component.html',
    styleUrls: ['./console-learning-bounties.component.scss', '../../console.component.scss']
})
export class ConsoleLearningBountiesComponent implements OnInit {

    public collections: any;
    public loaded: boolean;
    public now: Date;
    private outputResult: any;
    public activeTab: string;
    public userId;

    public ongoingArray: Array<any>;
    public upcomingArray: Array<any>;
    public pastArray: Array<any>;
    public pastBountiyObject: any;
    public liveBountiyObject: any;
    public upcomingBountiyObject: any;

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
        this.fetchBounties();
    }

    private fetchBounties() {
        this._collectionService.getParticipatingCollections(this.userId, '{ "relInclude": "calendarId", "where": {"type":"bounty"}, "include": ["calendars", {"owners":["profiles", "reviewsAboutYou", "ownedCollections"]}, {"participants": "profiles"}, "topics", {"contents":["schedules","views","submissions"]}, {"reviews":"peer"}] }', (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                this.ongoingArray = [];
                this.upcomingArray = [];
                this.pastArray = [];
                this.pastBountiyObject = {};
                this.liveBountiyObject = {};
                this.upcomingBountiyObject = {};
                this.createOutput(result);
                this.now = new Date();
                this.loaded = true;
            }
        });
    }

    private createOutput(data: any) {
        const now = moment();
        data.forEach(bounty => {
            bounty.calendars.forEach(calendar => {
                if (calendar.endDate) {
                    if (now.diff(moment.utc(calendar.endDate)) < 0) {
                        if (!now.isBetween(calendar.startDate, calendar.endDate)) {
                            if (bounty.id in this.upcomingBountiyObject) {
                                this.upcomingBountiyObject[bounty.id]['bounty']['calendars'].push(calendar);
                            } else {
                                this.upcomingBountiyObject[bounty.id] = {};
                                this.upcomingBountiyObject[bounty.id]['bounty'] = _.clone(bounty);
                                this.upcomingBountiyObject[bounty.id]['bounty']['calendars'] = [calendar];
                            }
                        } else {
                            if (bounty.id in this.liveBountiyObject) {
                                this.liveBountiyObject[bounty.id]['bounty']['calendars'].push(calendar);
                            } else {
                                this.liveBountiyObject[bounty.id] = {};
                                this.liveBountiyObject[bounty.id]['bounty'] = _.clone(bounty);
                                this.liveBountiyObject[bounty.id]['bounty']['calendars'] = [calendar];
                            }
                        }

                    } else {
                        if (bounty.id in this.pastBountiyObject) {
                            this.pastBountiyObject[bounty.id]['bounty']['calendars'].push(calendar);
                        } else {
                            this.pastBountiyObject[bounty.id] = {};
                            this.pastBountiyObject[bounty.id]['bounty'] = bounty;
                            this.pastBountiyObject[bounty.id]['bounty']['calendars'] = [calendar];
                        }
                    }
                }
            });
        });
        for (const key in this.pastBountiyObject) {
            if (this.pastBountiyObject.hasOwnProperty(key)) {
                this.pastBountiyObject[key].bounty.calendars.sort((a, b) => {
                    return this.compareCalendars(a, b);
                });
                this.pastArray.push(this.pastBountiyObject[key].bounty);
            }
        }
        this.pastArray.sort((a, b) => {
            return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
        });
        for (const key in this.upcomingBountiyObject) {
            if (this.upcomingBountiyObject.hasOwnProperty(key)) {
                this.upcomingBountiyObject[key].bounty.calendars.sort((a, b) => {
                    return this.compareCalendars(a, b);
                });
                this.upcomingArray.push(this.upcomingBountiyObject[key].bounty);
            }
        }

        this.upcomingArray.sort((a, b) => {
            return moment(a.calendars[0].startDate).diff(moment(b.calendars[0].startDate), 'days');
        });

        for (const key in this.liveBountiyObject) {
            if (this.liveBountiyObject.hasOwnProperty(key)) {
                this.ongoingArray.push(this.liveBountiyObject[key].bounty);
            }
        }
    }

    public compareCalendars(a, b) {
        return moment(a.startDate).diff(moment(b.startDate), 'days');
    }
    public onSelect(collection) {
        this.router.navigate(['bounty', collection.id, 'edit', 1]);
    }

    /**
      * exitBounties
      */
    public exitBounties(collection: any) {
        this._dialogService.openExitCollection(collection.id, this.userId, collection.type).subscribe((result: any) => {
            if (result) {
                this.fetchBounties();
                this.snackBar.open('You have dropped out of the ' + collection.type, 'Close', {
                    duration: 5000
                });
            } else {
                console.log(result);
            }
        });
    }


    public openCollection(collection: any) {
        this.router.navigateByUrl('/bounty/' + collection.id + '/calendar/' + collection.calendarId);
    }

    public viewTransaction(collection: any) {
        this.router.navigate(['console', 'account', 'transactions']);
    }

    public openProfile(peer: any) {
        this.router.navigate(['profile', peer.id]);
    }

}
