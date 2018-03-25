import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CollectionService } from '../../_services/collection/collection.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';

import { ConsoleComponent } from '../console.component';

declare var moment: any;
@Component({
    selector: 'app-console-teaching',
    templateUrl: './console-teaching.component.html',
    styleUrls: ['./console-teaching.component.scss', '../console.component.scss']
})
export class ConsoleTeachingComponent implements OnInit {

    public workshops: any;
    public loaded: boolean;
    public activeTab: string;
    public now: Date;
    public userId;
    public accountVerified: boolean;
    public session: any;
    constructor(
        private activatedRoute: ActivatedRoute,
        public router: Router,
        public _collectionService: CollectionService,
        private _cookieUtilsService: CookieUtilsService,
        public consoleComponent: ConsoleComponent,
        private dialogsService: DialogsService) {
        activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
            console.log(urlSegment[0].path);
            consoleComponent.setActiveTab(urlSegment[0].path);
        });
        this.activeTab = 'all';
        this.now = new Date();
        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {
        this.loaded = false;
        this.accountVerified = (this._cookieUtilsService.getValue('accountApproved') === 'true') ? true : false;
        this.getSessions();
    }

    public getSessions() {
        const option = {
            'where': {
                'type': 'session'
            }
        };
        this._collectionService.getAllCollections(option).subscribe((res: any) => {
            if (res && res.length > 0) {
                console.log(res);
                this.session = res;
            }
        });
    }

    /**
     * createWorkshop
     */
    public createWorkshop() {
        this._collectionService.postCollection(this.userId, 'workshop').subscribe((workshopObject: any) => {
            this.router.navigate(['workshop', workshopObject.id, 'edit', 1]);
        });
    }

    /**
     * createExperience
     */
    public createExperience() {
        this._collectionService.postCollection(this.userId, 'experience').subscribe((experienceObject: any) => {
            this.router.navigate(['experience', experienceObject.id, 'edit', 1]);
        });
    }

    /**
     * createSessions
     */
    public enableSessions() {
        this._collectionService.postCollection(this.userId, 'session').subscribe((sessionObject: any) => {
            this.router.navigate(['session', sessionObject.id, 'edit', 1]);
        });
    }

    /**
     * Check if the given tab is active tab
     * @param tabName
     * @returns {boolean}
     */
    public getActiveTab() {
        return this.activeTab;
    }

    /**
     * Set value of activeTab
     * @param value
     */
    public setActiveTab(value) {
        this.activeTab = value;
    }

    /**
     * Show popup to rate students
     */
    public showRateStudentsPopup(collection) {
        // Show popup here
        const query = {'relInclude': 'calendarId', 'include': ['profiles', 'reviewsAboutYou']};
        this._collectionService.getParticipants(collection.id, query).subscribe(
            result => {
                const participants = result;
                const data = collection;
                data.participants = participants;
                this.dialogsService.rateParticipant(data)
                    .subscribe();
        },
            err => {
                console.log('Could not fetch participants of this collection');
            });
    }

    imgErrorHandler(event) {
        event.target.src = '/assets/images/user-placeholder.jpg';
    }

    /**
     * Get the progress bar value of this workshop
     * @param workshop
     * @returns {number}
     */
    public getProgressValue(collection) {
        let max = 0;
        let progress = 0;
        collection.contents.forEach(content => {
            max++;
            const currentCalendar = this._collectionService.getCurrentCalendar(collection.calendars);
            if (currentCalendar !== undefined) {
                const contentStartDate = moment(currentCalendar.startDate).add(content.schedules[0].startDay, 'days');
                const contentEndDate = contentStartDate.add(content.schedules[0].endDay, 'days');
                switch (content.type) {
                    case 'online':
                        if (content.schedules && moment().diff(contentEndDate, 'days') >= 0) {
                            progress++;
                        }
                        break;

                    case 'project':
                        if (content.schedules && moment().diff(contentEndDate, 'days') >= 0) {
                            progress++;
                        }
                        break;

                    case 'in-person':
                        if (content.schedules && moment().diff(contentEndDate, 'days') >= 0) {
                            progress++;
                        }
                        break;

                    default:
                        break;
                }
            }
        });
        return (progress / max) * 100;
    }

    public getCompletedCalendars(calendars) {
        const completedCalendars = [];
        calendars.forEach(calendar => {
            if (calendar.status === 'complete') {
                completedCalendars.push(calendar);
            }
        });
        return completedCalendars;
    }

    public getCanceledCalendars(calendars) {
        const canceledCalendars = [];
        calendars.forEach(calendar => {
            if (calendar.status === 'cancelled') {
                canceledCalendars.push(calendar);
            }
        });
        return canceledCalendars;
    }

    public editSessions() {
        console.log(this.session);
        this.router.navigateByUrl('/session/' + this.session[0].id + '/edit/' + 1);
    }

}
