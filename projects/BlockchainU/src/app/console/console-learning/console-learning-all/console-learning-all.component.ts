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
    selector: 'app-console-learning-all',
    templateUrl: './console-learning-all.component.html',
    styleUrls: ['./console-learning-all.component.scss', '../../console.component.scss']
})
export class ConsoleLearningAllComponent implements OnInit {

    public collections: any;
    public loaded: boolean;
    public now: Date;
    private outputResult: any;
    public activeTab: string;
    public userId;

    public ongoingArray: Array<any>;
    public upcomingArray: Array<any>;
    public pastArray: Array<any>;
    public pastCollectionsObject: any;
    public liveCollectionsObject: any;
    public upcomingCollectionsObject: any;

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
                consoleLearningComponent.setActiveTab('all');
            } else {
                consoleLearningComponent.setActiveTab(urlSegment[0].path);
            }
        });
        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {
        this.loaded = false;
        this.fetchCollections();
    }

    private fetchCollections() {
        const query = {
            'relInclude': 'calendarId',
            'include': ['calendars',
                { 'owners': ['profiles', 'reviewsAboutYou', 'ownedCollections'] },
                { 'participants': 'profiles' },
                'topics',
                { 'contents': ['schedules', 'views', 'submissions'] },
                { 'reviews': 'peer' }]
        };

        this._collectionService.getParticipatingCollections(this.userId, JSON.stringify(query), (err, result) => {
            if (err) {
                console.log(err);
            } else {
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
            console.log(collection);
            collection.calendars.forEach(calendar => {
                console.log(calendar);
                if ((collection.calendarId === calendar.id || collection.type === 'bounty') && calendar.endDate) {
                    if (now.diff(moment.utc(calendar.endDate)) < 0) {
                        if (!now.isBetween(calendar.startDate, calendar.endDate)) {
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
                        }
                    }
                }
            });
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

    public compareCalendars(a, b) {
        return moment(a.startDate).diff(moment(b.startDate), 'days');
    }
    public onSelect(collection) {
        this.router.navigate([collection.type, collection.id, 'edit', 1]);
    }

    /**
     * exitCollection
     */
    public exitCollection(collection: any) {
        this._dialogService.openExitCollection(collection.id, this.userId, collection.type).subscribe((result: any) => {
            if (result) {
                this.fetchCollections();
                this.snackBar.open('You have dropped out of the ' + collection.type, 'Close', {
                    duration: 5000
                });
            } else {
                console.log(result);
            }
        });
    }

    public openCollection(collection: any) {
        if (collection.type === 'bounty' || collection.type === 'guide') {
            this.router.navigateByUrl('/' + collection.type + '/' + collection.id);
        } else {
            this.router.navigateByUrl('/' + collection.type + '/' + collection.id + '/calendar/' + collection.calendarId);

        }
    }

    public openProfile(peer: any) {
        this.router.navigate(['profile', peer.id]);
    }

    public viewTransaction(collection: any) {
        this.router.navigate(['console', 'account', 'transactions']);
    }

}
