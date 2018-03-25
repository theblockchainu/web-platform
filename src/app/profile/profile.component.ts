import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import { ProfileService } from '../_services/profile/profile.service';
import { CollectionService } from '../_services/collection/collection.service';
import { DialogsService } from '../_services/dialogs/dialog.service';
import { TopicService } from '../_services/topic/topic.service';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {environment} from '../../environments/environment';

import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
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
export class ProfileComponent implements OnInit {
  public cookieUserId;
  public loadingProfile = false;
  public loadingLearningJourney = true;
  public loadingPeers = true;
  public envVariable;
  public urluserId: string;
  public profileObj: any;
  public interestsArray: Array<string>;
  public userRating: number;
  public collectionTypes = ['workshops'];
  public participatingWorkshops: Array<any>;
  public recommendedpeers = [];
  public socialIdentities: any = [];
  public maxVisibleInterest = 3;
  public maxVisibleReviews = 4;
  public topicsTeaching = [];
  public reviewsFromLearners = [];
  public reviewsFromTeachers = [];
  public isTeacher: boolean;
  public offsetString: string;
  private queryForSocialIdentities = { 'include': ['identities', 'credentials'] };
  public connectedIdentities = {
    'facebook': false,
    'google': false
  };
  public other_languages;
  public today = new Date();
  public pastWorkshops: Array<any>;
  public ongoingWorkshops: Array<any>;
  public upcomingWorkshops: Array<any>;
  public pastExperiences: Array<any>;
  public ongoingExperiences: Array<any>;
  public upcomingExperiences: Array<any>;
  public availablePackages: Array<any>;
  public maxLength = 140;
  public learningJourneyFilter: string;

  constructor(
    public _profileService: ProfileService,
    private _cookieUtilsService: CookieUtilsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public _collectionService: CollectionService,
    private _topicService: TopicService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public _dialogsService: DialogsService
  ) {
      this.envVariable = environment;
    this.activatedRoute.params.subscribe((param) => {
      const calledUserId = param['profileId'];
      if (this.urluserId !== calledUserId) {
        this.urluserId = calledUserId;
        this.fetchData();
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnInit() {
  }

  public showAll(strLength) {
    if (strLength > this.maxLength) {
      this.maxLength = strLength;
    } else {
      this.maxLength = 140;
    }
  }

  private fetchData() {
    this.cookieUserId = this._cookieUtilsService.getValue('userId');
    this.loadingProfile = true;
    this.isTeacher = false;
    this.getProfileData();
  }
  private getIdentities() {
    this._profileService.getSocialIdentities(this.queryForSocialIdentities, this.urluserId).subscribe(
      (result) => {
        this.socialIdentities = result;
        if (this.socialIdentities.identities.length > 0) {
          this.socialIdentities.identities.forEach(element => {
            if (element.provider === 'google') {
              this.connectedIdentities.google = true;
            } else if (element.provider === 'facebook') {
              this.connectedIdentities.facebook = true;
            }
          });
        }
        if (this.socialIdentities.credentials.length > 0) {
          this.socialIdentities.credentials.forEach(element => {
            if (element.provider === 'google') {
              this.connectedIdentities.google = true;
            } else if (element.provider === 'facebook') {
              this.connectedIdentities.facebook = true;
            }
          });
        }
        this.getTeachingTopics();
      }
    );
  }

  private getRecommendedPeers() {
    const query = {
      'include': [
        'reviewsAboutYou',
        'profiles'
      ],
      'where': {
        'id': { 'neq': this.urluserId }
      },
      'limit': 6
    };
    this._profileService.getAllPeers(query).subscribe((result: any) => {
      this.recommendedpeers = [];
      for (const responseObj of result) {
        console.log(responseObj);
        responseObj.rating = this._collectionService.calculateRating(responseObj.reviewsAboutYou);
        this.recommendedpeers.push(responseObj);
      }
      this.loadingPeers = false;
    }, (err) => {
      console.log(err);
    });
  }

  private getTeachingTopics() {
    const queryTeaching = {
      'relInclude': 'experience'
    };
    this._profileService.getTeachingExternalTopics(this.urluserId, queryTeaching).subscribe((response: any) => {
      console.log(response);
      this.topicsTeaching = response;
      this.loadingProfile = false;
      this.loadingLearningJourney = true;
      if (this.profileObj.peer[0].collections) {
        this.getRecommendedWorkshops(this.profileObj.peer[0].collections);
      } else {
        this.loadingLearningJourney = false;
        this.loadingPeers = true;
        this.getRecommendedPeers();

      }
    });
  }

  private getRecommendedWorkshops(response: Array<any>) {
    this.participatingWorkshops = [];
    console.log(response);
    response.forEach(collection => {
      if (collection.reviews) {
        collection.rating = this._collectionService.calculateRating(collection.reviews);
      }
      this.participatingWorkshops.push(collection);
    });
    this.participatingWorkshops = _.uniqBy(this.participatingWorkshops, 'id');
    this.loadingLearningJourney = false;
    this.loadingPeers = true;
    this.getRecommendedPeers();
  }

  private getProfileData() {
    const query = {
      'include': [
        'education',
        'work',
        {
          'peer': ['topicsLearning', 'topicsTeaching',
            {
              'ownedCollections': [
                { 'contents': ['schedules'] }
                , 'calendars', 'packages']
            },
            { 'reviewsAboutYou': { 'peer': 'profiles' } },
            {
              'collections': [{ 'reviews': { 'peer': 'profiles' } }, { 'owners': ['profiles'] }],
            }
          ]
        }
      ]
    };
    this._profileService.getExternalProfileData(this.urluserId, query).subscribe((response) => {
      this.profileObj = response[0];
      console.log(this.profileObj);
      if (this.profileObj.other_languages) {
        this.profileObj.other_languages = this.profileObj.other_languages.filter(Boolean);
        this.other_languages = this.profileObj.other_languages.join(', ');
      } else {
        this.other_languages = 'No language provided';
      }

      this.setInterests();
      if (this.profileObj.peer[0].ownedCollections && this.profileObj.peer[0].ownedCollections.length > 0) {
        this.calculateCollectionDurations();
        this.computeReviews();
        this.isTeacher = true;
        this.offsetString = 'col-md-offset-1';
      } else {
        this.offsetString = 'custom-margin-left-20pc';
      }
      if (this.profileObj.peer[0].reviewsAboutYou) {
        this.userRating = this._collectionService.calculateRating(this.profileObj.peer[0].reviewsAboutYou);
      }
      this.getIdentities();
    });
  }

  private computeReviews() {
    // Compute reviews for Peer from Learner and Teachers
    const ownedCollectionsArray = this.profileObj.peer[0].ownedCollections;
    const reviewsAboutYou = this.profileObj.peer[0].reviewsAboutYou;
    if (reviewsAboutYou) {
      reviewsAboutYou.forEach(collection => {
        if (_.find(ownedCollectionsArray, function (o) { return o.id === collection.collectionId; })) {
          this.reviewsFromLearners.push(collection);
        } else {
          this.reviewsFromTeachers.push(collection);
        }
      });
    }
  }

  private setInterests() {
    this.interestsArray = [];
    if (this.profileObj.peer[0].topicsTeaching && this.profileObj.peer[0].topicsTeaching.length > 0) {
      this.profileObj.peer[0].topicsTeaching.forEach(topic => {
        this.interestsArray.push(topic.name);
      });
    }
    if (this.profileObj.peer[0].topicsLearning && this.profileObj.peer[0].topicsLearning.length > 0) {
      this.profileObj.peer[0].topicsLearning.forEach(topic => {
        if (!this.interestsArray.includes(topic.name)) {
          this.interestsArray.push(topic.name);
        }
      });
    }
  }

  private calculateCollectionDurations() {
    this.pastWorkshops = [];
    this.upcomingWorkshops = [];
    this.ongoingWorkshops = [];
    this.pastExperiences = [];
    this.upcomingExperiences = [];
    this.ongoingExperiences = [];
    this.availablePackages = [];
    this.profileObj.peer['0'].ownedCollections.forEach(collection => {
      if (collection.status === 'active') {
        collection.totalDuration = this.calculateTotalHours(collection);
        collection.itenaryArray = this.calculateItenaries(collection);
        collection = this.calculateCohorts(collection);
        if (collection.type === 'workshop' && collection.pastCohortCount > 0) {
          this.pastWorkshops.push(collection);
        }
        if (collection.type === 'workshop' && collection.upcomingCohortCount > 0) {
          this.upcomingWorkshops.push(collection);
        }
        if (collection.type === 'workshop' && collection.currentCohortCount > 0) {
          this.ongoingWorkshops.push(collection);
        }
        if (collection.type === 'experience' && collection.pastCohortCount > 0) {
          this.pastExperiences.push(collection);
        }
        if (collection.type === 'experience' && collection.upcomingCohortCount > 0) {
          this.upcomingExperiences.push(collection);
        }
        if (collection.type === 'experience' && collection.currentCohortCount > 0) {
          this.ongoingExperiences.push(collection);
        }
        if (collection.type === 'session') {
          collection.packages.forEach(packageObj => {
            this.availablePackages.push(packageObj);
          });
        }
      }
    });
  }

  private calculateCohorts(collection): any {
    collection.pastCohortCount = 0;
    collection.upcomingCohortCount = 0;
    collection.currentCohortCount = 0;

    if (collection.calendars) {
      collection.calendars.forEach(calendar => {
        if (calendar.endDate < this.today.toISOString()) {
          collection.pastCohortCount++;
        }
        if (calendar.startDate > this.today.toISOString()) {
          collection.upcomingCohortCount++;
        }
        if (calendar.endDate > this.today.toISOString() && calendar.startDate < this.today.toISOString()) {
          collection.currentCohortCount++;
        }
      });
    }
    return collection;
  }

  private calculateItenaries(workshop) {
    const itenariesObj = {};
    const itenaryArray = [];
    if (workshop.contents) {
      workshop.contents.forEach(contentObj => {
        if (itenariesObj.hasOwnProperty(contentObj.schedules[0].startDay)) {
          itenariesObj[contentObj.schedules[0].startDay].push(contentObj);
        } else {
          itenariesObj[contentObj.schedules[0].startDay] = [contentObj];
        }
      });

      for (const key in itenariesObj) {
        if (itenariesObj.hasOwnProperty(key)) {
          itenariesObj[key].sort(function (a, b) {
            return parseFloat(a.schedules[0].startTime) - parseFloat(b.schedules[0].startTime);
          });
          const itenary = {
            startDay: key,
            contents: itenariesObj[key]
          };
          itenaryArray.push(itenary);
        }
      }
      itenaryArray.sort(function (a, b) {
        return parseFloat(a.startDay) - parseFloat(b.startDay);
      });
    }
    return itenaryArray;
  }

  /**
   * calculateTotalHours
   */
  public calculateTotalHours(workshop) {
    let totalLength = 0;
    if (workshop.contents) {
      workshop.contents.forEach(content => {
        if (content.type === 'online') {
          const startMoment = moment(content.schedules[0].startTime);
          const endMoment = moment(content.schedules[0].endTime);
          const contentLength = moment.utc(endMoment.diff(startMoment)).format('HH');
          totalLength += parseInt(contentLength, 10);
        } else if (content.type === 'video') {

        }
      });
    }
    return totalLength.toString();
  }

  public toggleMaxInterest() {
    if (this.maxVisibleInterest === 3) {
      this.maxVisibleInterest = 999;
    } else {
      this.maxVisibleInterest = 3;
    }
  }

  public toggleMaxReviews() {
    if (this.maxVisibleReviews === 4) {
      this.maxVisibleReviews = 999;
    } else {
      this.maxVisibleReviews = 4;
    }
  }

  public reportProfile() {
    this._dialogsService.reportProfile().subscribe(result => {
      if (result) {
        console.log('report' + result);
        this._profileService.reportProfile(this.urluserId, {
          'description': result,
          'is_active': true
        }).subscribe((respone) => {
          console.log(respone);
          this.snackBar.open('Profile Reported', 'Close', {
            duration: 800
          });
        }, (err) => {
          this.snackBar.open('Profile Reported Failed', 'Retry', {
            duration: 800
          }).onAction().subscribe(() => {
            this.reportProfile();
          });
        });
      }
    });
  }

  public navigateTo(id: string) {
    this.router.navigate(['profile', id]);
  }

  imgErrorHandler(event) {
    event.target.src = '/assets/images/user-placeholder.jpg';
  }

  public getReviewedCollection(peer, collectionId) {
    let foundCollection: any;
    const collectionsArray = peer.collections;
    const ownedCollectionsArray = peer.ownedCollections;
    if (collectionsArray !== undefined) {
      foundCollection = collectionsArray.find((collection) => {
        return collection.id === collectionId;
      });
    }
    if (ownedCollectionsArray !== undefined && foundCollection === undefined) {
      foundCollection = ownedCollectionsArray.find((collection) => {
        return collection.id === collectionId;
      });
    }
    if (foundCollection === undefined) {
      foundCollection = {};
    }
    return foundCollection;

  }

  public getReviewedCalendar(calendars, calendarId) {
    if (calendars) {
      return calendars.find((calendar) => {
        return calendar.id === calendarId;
      }) !== undefined ? calendars.find((calendar) => {
        return calendar.id === calendarId;
      }) : {};
    } else {
      return {};
    }
  }

  public redirectToCollection(peer, reviewCollectionId, collectionCalendarId) {
    return '/' + this.getReviewedCollection(peer, reviewCollectionId).type + '/'
      + reviewCollectionId + '/calendar/' + collectionCalendarId + '';
  }

  /**
   * openCollectionGrid
type:string,title:string,collecions   */
  public openWorkshopGrid(title: string, collections: Array<any>) {
    this._dialogsService.openCollectionGrid(title, collections).subscribe(result => {
      if (result) {
        this.router.navigateByUrl('/workshop/' + result);
      }
    });
  }

  /**
   * bookSession
   */
  public bookSession() {
    this.router.navigateByUrl('/session/book/' + this.urluserId);
  }

}
