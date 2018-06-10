import {Component, OnInit} from '@angular/core';
import {CommunityPageComponent} from '../community-page.component';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import {CollectionService} from '../../../_services/collection/collection.service';
import {CommunityService} from '../../../_services/community/community.service';
import {DialogsService} from '../../../_services/dialogs/dialog.service';
import {environment} from '../../../../environments/environment';
import {CookieUtilsService} from '../../../_services/cookieUtils/cookie-utils.service';
import {ProfileService} from '../../../_services/profile/profile.service';

@Component({
    selector: 'app-community-page-experiences',
    templateUrl: './community-page-experiences.component.html',
    styleUrls: ['./community-page-experiences.component.scss']
})
export class CommunityPageExperiencesComponent implements OnInit {

    public ownedExperiences;
    public userId;
    public communityId;
    public experiences;
    private today = moment();
    public loadingExperiences = true;
    public envVariable;
    public userType = 'public';
    public loggedInUser;
    public loadingUser = true;

    constructor(public activatedRoute: ActivatedRoute,
                public communityPageComponent: CommunityPageComponent,
                public _collectionService: CollectionService,
                public _profileService: ProfileService,
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
                this._communityService.setActiveTab('experiences');
            } else {
                this._communityService.setActiveTab(urlSegment[0].path);
            }
        });
        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {
    	this.getLoggedInUser();
        this.getExperiences();
        this.getCollections();
    }
	
	private getLoggedInUser() {
		this._profileService.getPeerData(this.userId, {'include': ['profiles', 'reviewsAboutYou', 'ownedCollections', 'scholarships_joined']}).subscribe(res => {
			this.loggedInUser = res;
			this.loadingUser = false;
			console.log(this.loggedInUser);
			this.userType = this.communityPageComponent.getUserType();
		});
	}

    public getExperiences() {
        this._collectionService.getOwnedCollections(this.userId, JSON.stringify({'where': {'and': [{'status': 'active'}, {'type': 'experience'}]}}), (err, res) => {
            if (err) {
                console.log(err);
            } else {
                this.ownedExperiences = res;
            }
        });
    }

    public getCollections() {
        this.loadingExperiences = true;
        const query = { 'include': [{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'calendars', { 'bookmarks': 'peer' }], 'where': { 'type': 'experience' } };
        this._communityService.getCollections(this.communityId, query, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                const experiences = [];
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
                            experiences.push(collection);
                        } else {
                            console.log('price unavailable');
                        }
                    }
                });
                this.experiences = _.uniqBy(experiences, 'id');
                this.loadingExperiences = false;
            }
        });
    }

    public toggleBookmark(index: number) {
        if (!(this.experiences[index].bookmarks && this.experiences[index].bookmarks[0] && this.experiences[index].bookmarks[0].peer && this.experiences[index].bookmarks[0].peer[0] && this.experiences[index].bookmarks[0].peer[0].id === this.userId)) {
            this._collectionService.saveBookmark(this.experiences[index].id, (err, response) => {
                this.getCollections();
            });
        } else {
            this._collectionService.removeBookmark(this.experiences[index].bookmarks[0].id, (err, response) => {
                this.getCollections();
            });
        }
    }

    public addExperience(experienceId) {
        console.log(experienceId);
        if (experienceId !== null && experienceId.length > 0) {
            this._collectionService.linkCommunityToCollection(this.communityId, experienceId, (err: any, response: any) => {
                if (err) {
                    console.log(err);
                } else {
                    this.getCollections();
                }
            });
        }
    }

}
