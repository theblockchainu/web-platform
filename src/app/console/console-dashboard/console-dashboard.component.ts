import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleComponent } from '../console.component';
import { NotificationService } from '../../_services/notification/notification.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { UcFirstPipe, UcWordsPipe } from 'ngx-pipes';
import { CollectionService } from '../../_services/collection/collection.service';
import { MatSnackBar } from '@angular/material';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { ProfileService } from '../../_services/profile/profile.service';
import {environment} from '../../../environments/environment';
declare var moment: any;
import * as _ from 'lodash';

@Component({
    selector: 'app-console-dashboard',
    templateUrl: './console-dashboard.component.html',
    styleUrls: ['./console-dashboard.component.scss'],
    providers: [UcWordsPipe, UcFirstPipe]
})
export class ConsoleDashboardComponent implements OnInit {

    public picture_url = false;
    public notifications = [];
    public notificationsLoaded = false;
    public learningCollectionsLoaded = false;
    public profileLoaded = false;
    public collectionsLoaded = false;
    public userId;
    public activityMapping:
        { [k: string]: string } = { '=0': 'No activity', '=1': 'One activity', 'other': '# activities' };
    public hourMapping:
        { [k: string]: string } = { '=0': 'Less than an hour', '=1': 'One hour', 'other': '# hours' };

    public drafts: Array<any>;
    public ongoingArray: Array<any>;
    public upcomingArray: Array<any>;
    public pastArray: Array<any>;
    public pastCollectionsObject: any;
    public liveCollectionsObject: any;
    public upcomingCollectionsObject: any;
    public now: Date;
    public collections: Array<any> = [];
    public userRating: number;
    public envVariable;
    public ongoingLearningArray: Array<any>;
    public upcomingLearningArray: Array<any>;
    public pastLearningArray: Array<any>;
    public pastLearningCollectionsObject: any;
    public liveLearningCollectionsObject: any;
    public upcomingLearningCollectionsObject: any;
    public learningCollections: Array<any> = [];

    public totalTeachingRatingValue = 0;
    public totalTeachingRatingCount = 0;
    public totalTeaching5RatingCount = 0;

    public totalLearningRatingValue = 0;
    public totalLearningRatingCount = 0;
    public totalLearning5RatingCount = 0;

    public totalTeachingWorkshopCount = 0;
    public totalTeachingExperienceCount = 0;
    public totalTeachingTopicCount = 0;
    public totalTeachingEarningValue = 0;
    public totalTeachingViews = 0;

    public totalLearningWorkshopCount = 0;
    public totalLearningExperienceCount = 0;
    public totalLearningTopicCount = 0;

    public loggedInUser;

    constructor(
        public activatedRoute: ActivatedRoute,
        public consoleComponent: ConsoleComponent,
        public _notificationService: NotificationService,
        private ucwords: UcWordsPipe,
        private ucFirstPipe: UcFirstPipe,
        public router: Router,
        private _cookieUtilsService: CookieUtilsService,
        public _collectionService: CollectionService,
        private snackBar: MatSnackBar,
        private _dialogService: DialogsService,
        public _profileService: ProfileService,
    ) {
        this.envVariable = environment;
        activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
            console.log(urlSegment[0].path);
            consoleComponent.setActiveTab(urlSegment[0].path);
        });

        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {
        this.notificationsLoaded = false;
        this.collectionsLoaded = false;
        this.learningCollectionsLoaded = false;
        this.profileLoaded = false;
        this.fetchNotifications();
        this.fetchOwnedCollections();
        this.fetchLearningCollections();
        this.fetchProfileData();
    }

    private fetchProfileData() {
        this._profileService.getProfileData(this.userId, {
            include:
                [{ 'peer': ['reviewsAboutYou', 'collections', 'topicsLearning', 'topicsTeaching'] }]
        }).subscribe((profiles) => {
            if (profiles && profiles.length > 0) {
                this.loggedInUser = profiles[0];
                this.profileLoaded = true;
                if (profiles[0].peer[0].reviewsAboutYou) {
                    profiles[0].peer[0].reviewsAboutYou.forEach((review) => {
                        if (_.some(profiles[0].peer[0].collections, ['id', review.collectionId])) {
                            this.totalLearningRatingCount++;
                            this.totalLearningRatingValue += review.score;
                            if (review.score === 5) {
                                this.totalLearning5RatingCount++;
                            }
                        }
                    });
                }
                if (this.totalLearningRatingCount > 0) {
                    this.totalLearningRatingValue = this.totalLearningRatingValue / this.totalLearningRatingCount;
                } if (profiles[0].peer[0].topicsLearning) {
                    this.totalLearningTopicCount = profiles[0].peer[0].topicsLearning.length;
                } if (profiles[0].peer[0].topicsTeaching) {
                    this.totalTeachingTopicCount = profiles[0].peer[0].topicsTeaching.length;
                }
            }
        });
    }

    private fetchNotifications() {
        this._notificationService.getNotifications(this.userId,
            '{"include": [{"actor":"profiles"}, "collection"], "order": "createdAt DESC" }',
            (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    result.forEach(resultItem => {
                        if (resultItem.actor[0] !== undefined) {
                            this.notifications.push(resultItem);
                        }
                    });
                    this.notificationsLoaded = true;
                }
            });
    }

    private fetchOwnedCollections() {
        this._collectionService.getOwnedCollections(this.userId,
            '{"include": ["calendars", {"owners": "reviewsAboutYou"}, {"participants": ["reviewsAboutYou", ' +
            '"ownedCollections", "profiles"]}, "topics", "views", {"contents":"schedules"}] }', (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    this.drafts = [];
                    this.ongoingArray = [];
                    this.upcomingArray = [];
                    this.pastArray = [];
                    this.pastCollectionsObject = {};
                    this.liveCollectionsObject = {};
                    this.upcomingCollectionsObject = {};
                    this.createCollectionOutput(result);
                    this.now = new Date();
                    this.collectionsLoaded = true;
                }
            });
    }

    private fetchLearningCollections() {
        this._collectionService.getParticipatingCollections(this.userId,
            '{ "relInclude": "calendarId", "include": ["calendars", {"owners":["profiles", ' + '"reviewsAboutYou",'
            + ' "ownedCollections"]}, {"participants": "profiles"}, "topics", {"contents":["schedules","views","submissions"]},' +
            ' {"reviews":"peer"}] }', (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    this.ongoingLearningArray = [];
                    this.upcomingLearningArray = [];
                    this.pastLearningArray = [];
                    this.pastLearningCollectionsObject = {};
                    this.liveLearningCollectionsObject = {};
                    this.upcomingLearningCollectionsObject = {};
                    this.createLearningCollectionsOutput(result);
                    this.now = new Date();
                    this.learningCollectionsLoaded = true;
                }
            });
    }

    private createCollectionOutput(data: any) {
        const now = moment();
        data.forEach(collection => {

            // Count the total teaching workshops and experiences
            if (collection.type === 'workshop') {
                this.totalTeachingWorkshopCount++;
            } if (collection.type === 'experience') {
                this.totalTeachingExperienceCount++;
            } if (collection.views) {
                this.totalTeachingViews += collection.views.length;
            } if (collection.participants && collection.price) {
                this.totalTeachingEarningValue += (collection.price * collection.participants.length);
            }
            if (collection.status === 'draft' || collection.status === 'submitted' || collection.calendars.length === 0) {
                collection.itenaries = [];
                this.drafts.push(collection);
            } else {
                collection.itenaries = this._collectionService.calculateItenaries(collection, collection.calendars[0]);
                console.log(collection);
                collection.calendars.forEach(calendar => {
                    calendar.startDate = moment(calendar.startDate).toDate();
                    calendar.endDate = moment(calendar.endDate).hours(23).minutes(59).toDate();
                    const startDateMoment = moment(calendar.startDate).toDate();
                    const endDateMoment = moment(calendar.endDate).hours(23).minutes(59).toDate();
                    if (endDateMoment) {
                        if (now.diff(endDateMoment) < 0) {
                            if (!now.isBetween(startDateMoment, endDateMoment)) {
                                if (collection.id in this.upcomingCollectionsObject) {
                                    this.upcomingCollectionsObject[collection.id]['collection']['calendars'].push(calendar);
                                } else {
                                    this.upcomingCollectionsObject[collection.id] = {};
                                    this.upcomingCollectionsObject[collection.id]['collection'] = _.clone(collection);
                                    this.upcomingCollectionsObject[collection.id]['collection']['calendars'] = [calendar];
                                }
                                const reviews = [];
                                if (this.upcomingCollectionsObject[collection.id]['collection'].owners[0].reviewsAboutYou) {
                                    this.upcomingCollectionsObject[collection.id]['collection'].owners[0]
                                        .reviewsAboutYou.forEach(review => {
                                            if (review.collectionId === collection.id) {
                                                reviews.push(review);
                                                this.totalTeachingRatingCount++;
                                                this.totalTeachingRatingValue += review.score;
                                                if (review.score === 5) {
                                                    this.totalTeaching5RatingCount++;
                                                }
                                            }
                                        });
                                }
                                this.upcomingCollectionsObject[collection.id]['collection'].reviewValue =
                                    this._collectionService.calculateRating(reviews);
                            } else {
                                if (collection.id in this.liveCollectionsObject) {
                                    this.liveCollectionsObject[collection.id]['collection']['calendars'].push(calendar);
                                } else {
                                    this.liveCollectionsObject[collection.id] = {};
                                    this.liveCollectionsObject[collection.id]['collection'] = _.clone(collection);
                                    this.liveCollectionsObject[collection.id]['collection']['calendars'] = [calendar];
                                }
                                const reviews = [];
                                if (this.liveCollectionsObject[collection.id]['collection'].owners[0].reviewsAboutYou) {
                                    this.liveCollectionsObject[collection.id]['collection'].owners[0].reviewsAboutYou.forEach(review => {
                                        if (review.collectionId === collection.id) {
                                            reviews.push(review);
                                            this.totalTeachingRatingCount++;
                                            this.totalTeachingRatingValue += review.score;
                                            if (review.score === 5) {
                                                this.totalTeaching5RatingCount++;
                                            }
                                        }
                                    });
                                }
                                this.liveCollectionsObject[collection.id]['collection'].reviewValue
                                    = this._collectionService.calculateRating(reviews);
                            }

                        } else {
                            if (collection.id in this.pastCollectionsObject) {
                                this.pastCollectionsObject[collection.id]['collection']['calendars'].push(calendar);
                            } else {
                                this.pastCollectionsObject[collection.id] = {};
                                this.pastCollectionsObject[collection.id]['collection'] = collection;
                                this.pastCollectionsObject[collection.id]['collection']['calendars'] = [calendar];
                                let participantReviewCount = 0;
                                this.pastCollectionsObject[collection.id]['collection'].participants.forEach(participant => {
                                    if (participant.reviewsAboutYou && participant.reviewsAboutYou[0].collectionId === collection.id) {
                                        participantReviewCount += 1;
                                    }
                                });
                                const reviews = [];
                                if (this.pastCollectionsObject[collection.id]['collection'].owners[0].reviewsAboutYou) {
                                    this.pastCollectionsObject[collection.id]['collection'].owners[0].reviewsAboutYou.forEach(review => {
                                        if (review.collectionId === collection.id) {
                                            reviews.push(review);
                                            this.totalTeachingRatingCount++;
                                            this.totalTeachingRatingValue += review.score;
                                            if (review.score === 5) {
                                                this.totalTeaching5RatingCount++;
                                            }
                                        }
                                    });
                                }
                                this.pastCollectionsObject[collection.id]['collection'].participantReviewCount = participantReviewCount;
                                this.pastCollectionsObject[collection.id]['collection'].reviewValue
                                    = this._collectionService.calculateRating(reviews);
                            }
                        }
                    }
                });
            }
        });

        if (this.totalTeachingRatingCount > 0) {
            this.totalTeachingRatingValue = this.totalTeachingRatingValue / this.totalTeachingRatingCount;
        }

        this.drafts.sort((a, b) => {
            return moment(b.updatedAt).diff(moment(a.updatedAt), 'days');
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

        this.collections = _.union(this.ongoingArray, this.upcomingArray, this.pastArray);
    }

    public onSelect(collection) {
        this.router.navigate([collection.type, collection.id, 'edit', collection.stage.length > 0 ? collection.stage : 1]);
    }

    /**
     * compareCalendars
     */
    public compareCalendars(a, b) {
        return moment(a.startDate).diff(moment(b.startDate), 'days');
    }

    public getNotificationText(notification) {
        const replacements = {
            '%username%': '<b>' + this.ucwords.transform(notification.actor[0].profiles[0].first_name)
                + ' ' + this.ucwords.transform(notification.actor[0].profiles[0].last_name) + '</b>',
            '%collectionTitle%': (notification.collection !== undefined && notification.collection.length > 0)
                ? this.ucwords.transform(notification.collection[0].title) : '***',
            '%collectionName%': (notification.collection !== undefined && notification.collection.length > 0)
                ? '<b>' + this.ucwords.transform(notification.collection[0].title) + '</b>' : '***',
            '%collectionType%': (notification.collection !== undefined && notification.collection.length > 0)
                ? this.ucwords.transform(notification.collection[0].type) : '***'
        },
            str = notification.description;

        return str.replace(/%\w+%/g, function (all) {
            return replacements[all] || all;
        });
    }

    public getNotificationTime(notification) {
        const createdAt = moment(notification.createdAt);
        return createdAt.fromNow();
    }

    public hideNotification(notification) {
        notification.hidden = true;
        this._notificationService.updateNotification(this.userId, notification, (err, patchResult) => {
            if (err) {
                console.log(err);
                notification.hidden = false;
            }
        });
    }

    public onNotificationClick(notification) {
        this.router.navigate(notification.actionUrl);
    }

    public deleteCollection(collection: any) {
        this._dialogService.openDeleteCollection(collection).subscribe(result => {
            if (result) {
                this.fetchOwnedCollections();
                this.snackBar.open(this.ucFirstPipe.transform(collection.type) + ' Deleted', 'Close', {
                    duration: 800
                });
            }
        });
    }

    /**
     * cancelCollection
     * collection:any     */
    public cancelCollection(collection: any) {
        this._dialogService.openCancelCollection(collection).subscribe(result => {
            if (result) {
                this.fetchOwnedCollections();
                this.snackBar.open(this.ucFirstPipe.transform(collection.type) + ' Cancelled', 'Close', {
                    duration: 800
                });
            }
        });
    }

    /**
     * exitCollection
     */
    public exitCollection(collection: any) {
        this._dialogService.openExitCollection(collection.id, this.userId).subscribe(result => {
            if (result) {
                this.fetchLearningCollections();
                this.snackBar.open('You have dropped out of the ' + collection.type, 'Close', {
                    duration: 800
                });
            } else {
                console.log(result);
            }
        });
    }

    public openCollection(collection: any) {
        this.router.navigateByUrl('/' + collection.type + '/' + collection.id + '/calendar/' + collection.calendarId);
    }

    public openProfile(peerId: any) {
        this.router.navigate(['profile', peerId]);
    }

    public openEditProfile() {
        this.router.navigate(['console', 'profile', 'edit']);
    }

    public viewTransaction(collection: any) {
        this.router.navigate(['console', 'account', 'transactions']);
    }

    /**
     * calculate number of days of a workshop
     */
    public getThisCollectionDate(collection) {
        if (collection.calendarId === undefined) {
            return ' ';
        } else {
            const joinedCalendar = collection.calendars.find((calendar) => {
                return calendar.id === collection.calendarId;
            });
            if (joinedCalendar) {
                return moment(joinedCalendar.startDate).format('Do MMM') + ' - ' + moment(joinedCalendar.endDate).format('Do MMM');
            } else {
                return null;
            }
        }
    }

    /**
     * get calendar signed up by this learner
     */
    public getLearnerCalendar(collection) {
        if (collection.calendarId === undefined) {
            return null;
        } else {
            return collection.calendars.find((calendar) => {
                return calendar.id === collection.calendarId;
            });
        }
    }

    /**
     * Get difference in days
     */
    public getDaysBetween(startDate, endDate) {
        const a = moment(startDate);
        const b = moment(endDate);
        const diff = b.diff(a, 'days');
        switch (true) {
            case diff === 0:
                return 'today';
            case diff === 1:
                return 'yesterday';
            case diff > 1 && diff < 7:
                return diff + ' days ago';
            case diff >= 7 && diff < 30:
                return Math.floor(diff / 7) + ' weeks ago';
            case diff >= 30 && diff < 365:
                return Math.floor(diff / 30) + ' months ago';
            case diff >= 365:
                return Math.floor(diff / 365) + ' years ago';
            default:
                return diff + ' days ago';
        }
    }

    /**
     * Get the most upcoming content details
     */
    public getLearnerUpcomingEvent(collection) {
        const contents = collection.contents;
        const calendars = collection.calendars;
        const currentCalendar = this.getLearnerCalendar(collection);
        contents.sort((a, b) => {
            if (a.schedules[0].startDay < b.schedules[0].startDay) {
                return -1;
            }
            if (a.schedules[0].startDay > b.schedules[0].startDay) {
                return 1;
            }
            return 0;
        }).filter((element, index) => {
            return moment() < moment(element.startDay);
        });
        let fillerWord = '';
        if (contents[0].type === 'online') {
            fillerWord = 'session';
        } else if (contents[0].type === 'video') {
            fillerWord = 'recording';
        } else if (contents[0].type === 'project') {
            fillerWord = 'submission';
        } else if (contents[0].type === 'in-person') {
            fillerWord = 'session';
        } if (currentCalendar) {
            const contentStartDate = moment(currentCalendar.startDate).add(contents[0].schedules[0].startDay, 'days');
            const timeToStart = contentStartDate.diff(moment(), 'days');
            contents[0].timeToStart = timeToStart;
        } else {
            contents[0].timeToStart = 0;
        }
        contents[0].fillerWord = fillerWord;
        contents[0].hasStarted = false;
        return contents[0];
    }
    /**
     * Get the progress bar value of this workshop
     * @param workshop
     * @returns {number}
     */
    public getProgressValue(workshop) {
        let max = 0;
        let progress = 0;
        workshop.contents.forEach(content => {
            max++;
            switch (content.type) {
                case 'online':
                    if (content.views && content.views.length > 0) {
                        progress++;
                    }
                    break;

                case 'video':
                    if (content.views && content.views.length > 0) {
                        progress++;
                    }
                    break;

                case 'project':
                    if (content.submissions && content.submissions.length > 0) {
                        progress++;
                    }
                    break;

                case 'in-person':
                    if (content.presence && content.presence.length > 0) {
                        progress++;
                    }
                    break;

                default:
                    break;
            }
        });
        return (progress / max) * 100;
    }

    private createLearningCollectionsOutput(data: any) {
        const now = moment();
        data.forEach(collection => {
            if (collection.type === 'workshop') {
                this.totalLearningWorkshopCount++;
            } if (collection.type === 'experience') {
                this.totalLearningExperienceCount++;
            } collection.calendars.forEach(calendar => {
                if (collection.calendarId === calendar.id && calendar.endDate) {
                    if (now.diff(moment.utc(calendar.endDate)) < 0) {
                        if (!now.isBetween(calendar.startDate, calendar.endDate)) {
                            if (collection.id in this.upcomingLearningCollectionsObject) {
                                this.upcomingLearningCollectionsObject[collection.id]['collection']['calendars'].push(calendar);
                            } else {
                                this.upcomingLearningCollectionsObject[collection.id] = {};
                                this.upcomingLearningCollectionsObject[collection.id]['collection'] = _.clone(collection);
                                this.upcomingLearningCollectionsObject[collection.id]['collection']['calendars'] = [calendar];
                            }
                        } else {
                            if (collection.id in this.liveLearningCollectionsObject) {
                                this.liveLearningCollectionsObject[collection.id]['collection']['calendars'].push(calendar);
                            } else {
                                this.liveLearningCollectionsObject[collection.id] = {};
                                this.liveLearningCollectionsObject[collection.id]['collection'] = _.clone(collection);
                                this.liveLearningCollectionsObject[collection.id]['collection']['calendars'] = [calendar];
                            }
                        }

                    } else {
                        if (collection.id in this.pastLearningCollectionsObject) {
                            this.pastLearningCollectionsObject[collection.id]['collection']['calendars'].push(calendar);
                        } else {
                            this.pastLearningCollectionsObject[collection.id] = {};
                            this.pastLearningCollectionsObject[collection.id]['collection'] = collection;
                            this.pastLearningCollectionsObject[collection.id]['collection']['calendars'] = [calendar];
                        }
                    }
                }
            });
        });
        for (const key in this.pastLearningCollectionsObject) {
            if (this.pastLearningCollectionsObject.hasOwnProperty(key)) {
                this.pastLearningCollectionsObject[key].collection.calendars.sort((a, b) => {
                    return this.compareCalendars(a, b);
                });
                this.pastLearningArray.push(this.pastLearningCollectionsObject[key].collection);
            }
        }
        this.pastLearningArray.sort((a, b) => {
            return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
        });
        for (const key in this.upcomingLearningCollectionsObject) {
            if (this.upcomingLearningCollectionsObject.hasOwnProperty(key)) {
                this.upcomingLearningCollectionsObject[key].collection.calendars.sort((a, b) => {
                    return this.compareCalendars(a, b);
                });
                this.upcomingLearningArray.push(this.upcomingLearningCollectionsObject[key].collection);
            }
        }

        this.upcomingLearningArray.sort((a, b) => {
            return moment(a.calendars[0].startDate).diff(moment(b.calendars[0].startDate), 'days');
        });

        for (const key in this.liveLearningCollectionsObject) {
            if (this.liveLearningCollectionsObject.hasOwnProperty(key)) {
                this.ongoingLearningArray.push(this.liveLearningCollectionsObject[key].collection);
            }
        }

        this.learningCollections = _.union(this.ongoingLearningArray, this.upcomingLearningArray, this.pastLearningArray);

    }

}
