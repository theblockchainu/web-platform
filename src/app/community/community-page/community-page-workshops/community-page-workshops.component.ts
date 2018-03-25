import {Component, OnInit} from '@angular/core';
import {CommunityPageComponent} from '../community-page.component';
import {ActivatedRoute} from '@angular/router';
import {CollectionService} from '../../../_services/collection/collection.service';
import {CookieUtilsService} from '../../../_services/cookieUtils/cookie-utils.service';
import {CommunityService} from '../../../_services/community/community.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import {DialogsService} from '../../../_services/dialogs/dialog.service';
import {environment} from '../../../../environments/environment';

@Component({
    selector: 'app-community-page-workshops',
    templateUrl: './community-page-workshops.component.html',
    styleUrls: ['./community-page-workshops.component.scss']
})
export class CommunityPageWorkshopsComponent implements OnInit {

    public ownedWorkshops;
    public userId;
    public communityId;
    public workshops;
    private today = moment();
    public loadingWorkshops = true;
    public envVariable;

    constructor(public activatedRoute: ActivatedRoute,
                public communityPageComponent: CommunityPageComponent,
                public _collectionService: CollectionService,
                public _communityService: CommunityService,
                public _dialogsService: DialogsService,
                public _cookieUtilsService: CookieUtilsService) {
        this.envVariable = environment;
        activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
            console.log('activated route is: ' + JSON.stringify(urlSegment));
            if (urlSegment[0] === undefined) {
                this.communityId = '';
            } else {
                this.communityId = urlSegment[0].path;
            }
        });
        this.activatedRoute.pathFromRoot[5].url.subscribe((urlSegment) => {
            console.log('activated route is: ' + JSON.stringify(urlSegment));
            if (urlSegment[0] === undefined) {
                this._communityService.setActiveTab('workshops');
            } else {
                this._communityService.setActiveTab(urlSegment[0].path);
            }
        });
        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {
        this.getWorkshops();
        this.getCollections();
    }

    public getWorkshops() {
        this._collectionService.getOwnedCollections(this.userId, JSON.stringify({'where': {'and': [{'status': 'active'}, {'type': 'workshop'}]}}), (err, res) => {
            if (err) {
                console.log(err);
            } else {
                this.ownedWorkshops = res;
            }
        });
    }

    public getCollections() {
        this.loadingWorkshops = true;
        const query = { 'include': [{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'calendars', { 'bookmarks': 'peer' }], 'where': { 'type': 'workshop' } };
        this._communityService.getCollections(this.communityId, query, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                const workshops = [];
                res.forEach(collection => {
                    if (collection.status === 'active') {
                        if (collection.owners && collection.owners[0].reviewsAboutYou) {
                            collection.rating = this._collectionService.calculateCollectionRating(collection.id, collection.owners[0].reviewsAboutYou);
                            collection.ratingCount = this._collectionService.calculateCollectionRatingCount(collection.id, collection.owners[0].reviewsAboutYou);
                        }
                        let hasActiveCalendar = false;
                        collection.calendars.forEach(calendar => {
                            if (moment(calendar.startDate).diff(this.today, 'days') >= -1) {
                                hasActiveCalendar = true;
                                return;
                            }
                        });
                        if (collection.price !== undefined) {
                            workshops.push(collection);
                        } else {
                            console.log('price unavailable');
                        }
                    }
                });
                this.workshops = _.uniqBy(workshops, 'id');
                this.loadingWorkshops = false;
            }
        });
    }

    public toggleBookmark(index: number) {
        if (!(this.workshops[index].bookmarks && this.workshops[index].bookmarks[0] && this.workshops[index].bookmarks[0].peer && this.workshops[index].bookmarks[0].peer[0] && this.workshops[index].bookmarks[0].peer[0].id === this.userId)) {
            this._collectionService.saveBookmark(this.workshops[index].id, (err, response) => {
                this.getCollections();
            });
        } else {
            this._collectionService.removeBookmark(this.workshops[index].bookmarks[0].id, (err, response) => {
                this.getCollections();
            });
        }
    }

    public addWorkshop(workshopId) {
        console.log(workshopId);
        if (workshopId !== null && workshopId.length > 0) {
            this._collectionService.linkCommunityToCollection(this.communityId, workshopId, (err: any, response: any) => {
                if (err) {
                    console.log(err);
                } else {
                    this.getCollections();
                }
            });
        }
    }

}
