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
    selector: 'app-console-learning-experiences',
    templateUrl: './console-learning-experiences.component.html',
    styleUrls: ['./console-learning-experiences.component.scss', '../../console.component.scss']
})
export class ConsoleLearningExperiencesComponent implements OnInit {

    public collections: any;
    public loaded: boolean;
    public now: Date;
    private outputResult: any;
    public activeTab: string;
    public userId;

    public ongoingArray: Array<any>;
    public upcomingArray: Array<any>;
    public pastArray: Array<any>;
    public pastExperienceObject: any;
    public liveExperienceObject: any;
    public upcomingExperienceObject: any;

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
        this.fetchExperiences();
    }

    private fetchExperiences() {
        this._collectionService.getParticipatingCollections(this.userId, '{ "relInclude": "calendarId", "where": {"type":"experience"}, "include": ["calendars", {"owners":["profiles", "reviewsAboutYou", "ownedCollections"]}, {"participants": "profiles"}, "topics", {"contents":["schedules","views","submissions"]}, {"reviews":"peer"}] }', (err, result) => {
            if (err) {
                console.log(err);
            } else {
                this.ongoingArray = [];
                this.upcomingArray = [];
                this.pastArray = [];
                this.pastExperienceObject = {};
                this.liveExperienceObject = {};
                this.upcomingExperienceObject = {};
                this.createOutput(result);
                this.now = new Date();
                this.loaded = true;
            }
        });
    }

    private createOutput(data: any) {
        const now = moment();
        data.forEach(experience => {
            experience.calendars.forEach(calendar => {
                if (experience.calendarId === calendar.id && calendar.endDate) {
                    if (now.diff(moment.utc(calendar.endDate)) < 0) {
                        if (!now.isBetween(calendar.startDate, calendar.endDate)) {
                            if (experience.id in this.upcomingExperienceObject) {
                                this.upcomingExperienceObject[experience.id]['experience']['calendars'].push(calendar);
                            } else {
                                this.upcomingExperienceObject[experience.id] = {};
                                this.upcomingExperienceObject[experience.id]['experience'] = _.clone(experience);
                                this.upcomingExperienceObject[experience.id]['experience']['calendars'] = [calendar];
                            }
                        } else {
                            if (experience.id in this.liveExperienceObject) {
                                this.liveExperienceObject[experience.id]['experience']['calendars'].push(calendar);
                            } else {
                                this.liveExperienceObject[experience.id] = {};
                                this.liveExperienceObject[experience.id]['experience'] = _.clone(experience);
                                this.liveExperienceObject[experience.id]['experience']['calendars'] = [calendar];
                            }
                        }

                    } else {
                        if (experience.id in this.pastExperienceObject) {
                            this.pastExperienceObject[experience.id]['experience']['calendars'].push(calendar);
                        } else {
                            this.pastExperienceObject[experience.id] = {};
                            this.pastExperienceObject[experience.id]['experience'] = experience;
                            this.pastExperienceObject[experience.id]['experience']['calendars'] = [calendar];
                        }
                    }
                }
            });
        });
        for (const key in this.pastExperienceObject) {
            if (this.pastExperienceObject.hasOwnProperty(key)) {
                this.pastExperienceObject[key].experience.calendars.sort((a, b) => {
                    return this.compareCalendars(a, b);
                });
                this.pastArray.push(this.pastExperienceObject[key].experience);
            }
        }
        this.pastArray.sort((a, b) => {
            return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
        });
        for (const key in this.upcomingExperienceObject) {
            if (this.upcomingExperienceObject.hasOwnProperty(key)) {
                this.upcomingExperienceObject[key].experience.calendars.sort((a, b) => {
                    return this.compareCalendars(a, b);
                });
                this.upcomingArray.push(this.upcomingExperienceObject[key].experience);
            }
        }

        this.upcomingArray.sort((a, b) => {
            return moment(a.calendars[0].startDate).diff(moment(b.calendars[0].startDate), 'days');
        });

        for (const key in this.liveExperienceObject) {
            if (this.liveExperienceObject.hasOwnProperty(key)) {
                this.ongoingArray.push(this.liveExperienceObject[key].experience);
            }
        }
    }

    public compareCalendars(a, b) {
        return moment(a.startDate).diff(moment(b.startDate), 'days');
    }
    public onSelect(collection) {
        this.router.navigate(['experience', collection.id, 'edit', 1]);
    }

    /**
      * exitExperiences
      */
    public exitExperiences(collection: any) {
        this._dialogService.openExitCollection(collection.id, this.userId, collection.type).subscribe((result: any) => {
            if (result) {
                this.fetchExperiences();
                this.snackBar.open('You have dropped out of the ' + collection.type, 'Close', {
                    duration: 5000
                });
            } else {
                console.log(result);
            }
        });
    }


    public openCollection(collection: any) {
        this.router.navigateByUrl('/experience/' + collection.id + '/calendar/' + collection.calendarId);
    }

    public viewTransaction(collection: any) {
        this.router.navigate(['console', 'account', 'transactions']);
    }

    public openProfile(peer: any) {
        this.router.navigate(['profile', peer.id]);
    }

}
