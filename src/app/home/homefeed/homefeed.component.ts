import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../_services/collection/collection.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { TopicService } from '../../_services/topic/topic.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { CommunityService } from '../../_services/community/community.service';

@Component({
    selector: 'app-feed',
    templateUrl: './homefeed.component.html',
    styleUrls: ['./homefeed.component.scss'],
    animations: [
        trigger('slideInOut', [
            state('in', style({
                transform: 'translate3d(0, 0, 0)'
            })),
            state('out', style({
                transform: 'translate3d(100%, 0, 0)'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
        ]),
    ]
})
export class HomefeedComponent implements OnInit {
    public workshops: Array<any>;
    public experiences: Array<any>;
    public communities: Array<any>;
    public userId;
    public peers: Array<any>;
    public loadingWorkshops = false;
    public loadingExperiences = false;
    public loadingCommunities = false;
    public loadingPeers = false;
    public loadingContinueLearning = false;
    private today = moment();

    public ongoingArray: Array<any>;
    public upcomingArray: Array<any>;
    public pastArray: Array<any>;
    public pastWorkshopsObject: any;
    public liveWorkshopsObject: any;
    public upcomingWorkshopsObject: any;
    public now: Date;
    public cardInFocus = false;

    constructor(
        public _collectionService: CollectionService,
        public _profileService: ProfileService,
        private _cookieUtilsService: CookieUtilsService,
        private _topicService: TopicService,
        public _dialogsService: DialogsService,
        public _communityService: CommunityService
    ) {
        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {
        this.fetchContinueLearning();
        this.fetchWorkshops();
        this.fetchExperiences();
        this.fetchPeers();
        this.fetchCommunities();
    }

    private fetchContinueLearning() {
        this.loadingContinueLearning = true;
        this._collectionService.getParticipatingCollections(this.userId,
            '{ "relInclude": "calendarId", "where": {"type":"workshop"}, "include": ' +
            '["calendars", {"owners":["profiles", "reviewsAboutYou", "ownedCollections"]},' +
            ' {"participants": "profiles"}, "topics", {"contents":["schedules","views","submissions"]}, ' +
            '{"reviews":"peer"}] }', (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    this.ongoingArray = [];
                    this.upcomingArray = [];
                    this.liveWorkshopsObject = {};
                    this.upcomingWorkshopsObject = {};
                    this.createOutput(result);
                    this.now = new Date();
                    this.loadingContinueLearning = false;
                }
            });
    }

    private createOutput(data: any) {
        const now = moment();
        data.forEach(workshop => {
            workshop.calendars.forEach(calendar => {
                if (workshop.calendarId === calendar.id && calendar.endDate) {
                    if (now.diff(moment.utc(calendar.endDate)) < 0) {
                        if (now.isBetween(calendar.startDate, calendar.endDate)) {
                            if (workshop.id in this.liveWorkshopsObject) {
                                this.liveWorkshopsObject[workshop.id]['workshop']['calendars'].push(calendar);
                            } else {
                                this.liveWorkshopsObject[workshop.id] = {};
                                this.liveWorkshopsObject[workshop.id]['workshop'] = _.clone(workshop);
                                this.liveWorkshopsObject[workshop.id]['workshop']['calendars'] = [calendar];
                            }
                        }
                    }
                }
            });
        });

        for (const key in this.liveWorkshopsObject) {
            if (this.liveWorkshopsObject.hasOwnProperty(key)) {
                this.ongoingArray.push(this.liveWorkshopsObject[key].workshop);
            }
        }
    }

    public compareCalendars(a, b) {
        return moment(a.startDate).diff(moment(b.startDate), 'days');
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
        }
        if (currentCalendar) {
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

    fetchWorkshops() {
        const query = {
            'include': [
                {
                    'relation': 'collections', 'scope': {
                        'include':
                            [{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'calendars',
                            { 'bookmarks': 'peer' }], 'where': { 'type': 'workshop' }
                    }
                }
            ],
            'order': 'createdAt desc'
        };
        this.loadingWorkshops = true;
        this._topicService.getTopics(query).subscribe(
            (response) => {
                this.loadingWorkshops = false;
                this.workshops = [];
                for (const responseObj of response) {
                    responseObj.collections.forEach(collection => {
                        if (collection.status === 'active') {
                            if (collection.owners && collection.owners[0].reviewsAboutYou) {
                                collection.rating = this._collectionService
                                    .calculateCollectionRating(collection.id, collection.owners[0].reviewsAboutYou);
                                collection.ratingCount = this._collectionService
                                    .calculateCollectionRatingCount(collection.id, collection.owners[0].reviewsAboutYou);
                            }
                            let hasActiveCalendar = false;
                            if (collection.calendars) {
                                collection.calendars.forEach(calendar => {
                                    if (moment(calendar.startDate).diff(this.today, 'days') >= -1) {
                                        hasActiveCalendar = true;
                                        return;
                                    }
                                });
                            }
                            if (hasActiveCalendar) {
                                this.workshops.push(collection);
                            }
                        }
                    });
                }
                this.workshops = _.uniqBy(this.workshops, 'id');
                this.workshops = _.orderBy(this.workshops, ['createdAt'], ['desc']);
                this.workshops = _.chunk(this.workshops, 5)[0];

            }, (err) => {
                console.log(err);
            }
        );
    }

    fetchExperiences() {
        const query = {
            'include': [
                {
                    'relation': 'collections', 'scope': {
                        'include':
                            [{ 'owners': ['reviewsAboutYou', 'profiles'] },
                                'calendars', { 'bookmarks': 'peer' }, {
                                'contents':
                                    ['schedules', 'locations']
                            }], 'where': { 'type': 'experience' }
                    }
                }
            ],
            'order': 'createdAt desc'
        };
        this.loadingExperiences = true;
        this._topicService.getTopics(query).subscribe(
            (response) => {
                this.loadingExperiences = false;
                this.experiences = [];
                for (const responseObj of response) {
                    responseObj.collections.forEach(collection => {
                        let experienceLocation = 'Unknown location';
                        let lat = 37.5293864;
                        let lng = -122.008471;
                        if (collection.status === 'active') {
                            if (collection.contents) {
                                collection.contents.forEach(content => {
                                    if (content.locations && content.locations.length > 0
                                        && content.locations[0].city !== undefined
                                        && content.locations[0].city.length > 0) {
                                        experienceLocation = content.locations[0].city;
                                        lat = parseFloat(content.locations[0].map_lat);
                                        lng = parseFloat(content.locations[0].map_lng);
                                    }
                                });
                                collection.location = experienceLocation;
                                collection.lat = lat;
                                collection.lng = lng;
                            }
                            if (collection.owners && collection.owners[0].reviewsAboutYou) {
                                collection.rating = this._collectionService
                                    .calculateCollectionRating(collection.id, collection.owners[0].reviewsAboutYou);
                                collection.ratingCount = this._collectionService
                                    .calculateCollectionRatingCount(collection.id, collection.owners[0].reviewsAboutYou);
                            }
                            let hasActiveCalendar = false;
                            if (collection.calendars) {
                                collection.calendars.forEach(calendar => {
                                    if (moment(calendar.startDate).diff(this.today, 'days') >= -1) {
                                        hasActiveCalendar = true;
                                        return;
                                    }
                                });
                            }
                            if (hasActiveCalendar) {
                                this.experiences.push(collection);
                            }
                        }
                    });
                }
                this.experiences = _.uniqBy(this.experiences, 'id');
                this.experiences = _.orderBy(this.experiences, ['createdAt'], ['desc']);
                this.experiences = _.chunk(this.experiences, 5)[0];

            }, (err) => {
                console.log(err);
            }
        );
    }


    fetchCommunities() {
        const query = {
            'include': [
                {
                    'relation': 'communities', 'scope': {
                        'include': [
                            'topics',
                            'views',
                            'invites',
                            'rooms',
                            { 'collections': ['owners'] },
                            'links',
                            { 'participants': [{ 'profiles': ['work'] }] },
                            { 'owners': [{ 'profiles': ['work'] }] }
                        ]
                    }
                }
            ],
            'order': 'createdAt desc'
        };
        this.loadingCommunities = true;
        this._topicService.getTopics(query).subscribe(
            (response) => {
                this.loadingCommunities = false;
                this.communities = [];
                for (const responseObj of response) {
                    responseObj.communities.forEach(community => {
                        if (community.status === 'active') {
                            this.communities.push(community);
                        }
                    });
                }
                this.communities = _.uniqBy(this.communities, 'id');
                this.communities = _.orderBy(this.communities, ['createdAt'], ['desc']);
                this.communities = _.chunk(this.communities, 5)[0];

            }, (err) => {
                console.log(err);
            }
        );
    }


    fetchPeers() {
        const query = {
            'include': [
                'reviewsAboutYou',
                'profiles'
            ],
            'where': {
                'id': { 'neq': this.userId }
            },
            'limit': 6,
            'order': 'createdAt desc'
        };
        this.loadingPeers = true;
        this._profileService.getAllPeers(query).subscribe((result: any) => {
            this.loadingPeers = false;
            this.peers = [];
            for (const responseObj of result) {
                responseObj.rating = this._collectionService.calculateRating(responseObj.reviewsAboutYou);
                this.peers.push(responseObj);
            }
        }, (err) => {
            console.log(err);
        });
    }

    onMouseEnter() {
        this.cardInFocus = true;
    }

    onMouseLeave() {
        this.cardInFocus = false;
    }

    public toggleWorkshopBookmark(index: number) {
        if (!(this.workshops[index].bookmarks
            && this.workshops[index].bookmarks[0] && this.workshops[index].bookmarks[0].peer
            && this.workshops[index].bookmarks[0].peer[0] && this.workshops[index].bookmarks[0].peer[0].id === this.userId)) {
            this._collectionService.saveBookmark(this.workshops[index].id, (err, response) => {
                this.fetchWorkshops();
            });
        } else {
            this._collectionService.removeBookmark(this.workshops[index].bookmarks[0].id, (err, response) => {
                this.fetchWorkshops();
            });
        }
    }


    public toggleExperienceBookmark(index: number) {
        if (!(this.experiences[index].bookmarks && this.experiences[index].bookmarks[0]
            && this.experiences[index].bookmarks[0].peer && this.experiences[index].bookmarks[0].peer[0]
            && this.experiences[index].bookmarks[0].peer[0].id === this.userId)) {
            this._collectionService.saveBookmark(this.experiences[index].id, (err, response) => {
                this.fetchExperiences();
            });
        } else {
            this._collectionService.removeBookmark(this.experiences[index].bookmarks[0].id, (err, response) => {
                this.fetchExperiences();
            });
        }
    }

    public toggleCommunityBookmark(index: number) {
        if (!(this.communities[index].bookmarks
            && this.communities[index].bookmarks[0] && this.communities[index].bookmarks[0].peer
            && this.communities[index].bookmarks[0].peer[0] && this.communities[index].bookmarks[0].peer[0].id === this.userId)) {
            this._communityService.saveBookmark(this.communities[index].id, (err, response) => {
                this.fetchCommunities();
            });
        } else {
            this._communityService.removeBookmark(this.communities[index].bookmarks[0].id, (err, response) => {
                this.fetchCommunities();
            });
        }
    }

}

