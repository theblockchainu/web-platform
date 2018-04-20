import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CollectionService } from '../../_services/collection/collection.service';
import { TopicService } from '../../_services/topic/topic.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { MatDialog } from '@angular/material';
import { SelectTopicsComponent } from '../dialogs/select-topics/select-topics.component';
import { SelectPriceComponent } from '../dialogs/select-price/select-price.component';
import 'rxjs/add/operator/do';
import * as moment from 'moment';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-workshops',
  templateUrl: './workshops.component.html',
  styleUrls: ['./workshops.component.scss'],
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
export class WorkshopsComponent implements OnInit {
  public availableTopics: Array<any>;
  public topicsBackup: Array<any>;
  public envVariable;
  public userId;
  public workshops: Array<any>;
  @ViewChild('topicButton') topicButton;
  @ViewChild('priceButton') priceButton;
  public availableRange: Array<number>;
  public selectedRange: Array<number>;
  public initialized: boolean;
  public selectedTopics: Array<any>;
  public loading = false;
  private today = moment();
  constructor(
    public _collectionService: CollectionService,
    public _profileService: ProfileService,
    private _cookieUtilsService: CookieUtilsService,
    private _topicService: TopicService,
    public dialog: MatDialog,
    public elRef: ElementRef,
    public _dialogsService: DialogsService
  ) {
    this.envVariable = environment;
    this.userId = _cookieUtilsService.getValue('userId');
  }
  ngOnInit() {
    this.fetchData();
  }

  private fetchData() {
    this.loading = true;
    this.fetchTopics().subscribe(
      response => {
        this.loading = false;
        this.availableTopics = response;
        this.topicsBackup = _.cloneDeep(response);
        this.fetchWorkshops();
      }, err => {
        this.loading = false;
        console.log(err);
      });
  }

  setPriceRange(): void {
    if (this.workshops.length > 0) {
      this.availableRange = [
        _.minBy(this.workshops, function (o) {
          return o.price;
        }).price,
        _.maxBy(this.workshops, function (o) { return o.price; }).price
      ];
      this.selectedRange = _.clone(this.availableRange);
    }
  }

  fetchTopics(): Observable<Array<any>> {
    const query = {};
    return this._topicService.getTopics(query).map(
      (response) => {
        const availableTopics = [];
        response.forEach(topic => {
          availableTopics.push({ 'topic': topic, 'checked': false });
        });
        return availableTopics;
      }, (err) => {
        console.log(err);
      }
    );
  }

  fetchWorkshops(): void {
    let query;
    this.selectedTopics = [];
    for (const topicObj of this.availableTopics) {
      if (topicObj['checked']) {
        this.selectedTopics.push({ 'name': topicObj['topic'].name });
      }
    }
    if (this.selectedTopics.length < 1) {
      query = {
        'include': [
          { 'relation': 'collections', 'scope': { 'include': [{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'calendars', { 'bookmarks': 'peer' }], 'where': { 'type': 'workshop' } } }
        ]
      };
    } else {
      query = {
        'include': [
          { 'relation': 'collections', 'scope': { 'include': [{ 'owners': ['reviewsAboutYou', 'profiles'] }, 'calendars', { 'bookmarks': 'peer' }], 'where': { 'type': 'workshop' } } }
        ],
        'where': { or: this.selectedTopics }
      };
    }


    this._topicService.getTopics(query)
      .subscribe(
        (response) => {
          const workshops = [];
          for (const responseObj of response) {
            responseObj.collections.forEach(collection => {
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
                if (collection.price !== undefined && hasActiveCalendar) {
                  if (this.selectedRange) {
                    if (collection.price >= this.selectedRange[0] && collection.price <= this.selectedRange[1]) {
                      workshops.push(collection);
                    }
                  } else {
                    workshops.push(collection);
                  }
                } else {
                  console.log('price unavailable');
                }
              }
            });
          }
          this.workshops = _.uniqBy(workshops, 'id');
          this.workshops = _.orderBy(this.workshops, ['createdAt'], ['desc']);
          if (!this.initialized) {
            this.setPriceRange();
            this.initialized = true;
          }
        }, (err) => {
          console.log(err);
        }
      );
  }

  openTopicsDialog(): void {
    const dialogRef = this.dialog.open(SelectTopicsComponent, {
      width: '250px',
      height: '300px',
      data: this.availableTopics,
      disableClose: true,
      panelClass: ['responsive-dialog', 'responsive-fixed-position'],
      position: {
        top: this.topicButton._elementRef.nativeElement.getBoundingClientRect().top + 'px',
        left: this.topicButton._elementRef.nativeElement.getBoundingClientRect().left + 'px'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.availableTopics = result;
        this.fetchWorkshops();
      }
    });
  }

  openPriceDialog(): void {
    const dialogRef = this.dialog.open(SelectPriceComponent, {
      width: '200px',
      height: '190px',
      panelClass: ['responsive-dialog', 'responsive-fixed-position'],
      data: {
        availableRange: this.availableRange,
        selectedRange: this.selectedRange
      },
      disableClose: true,
      position: {
        top: this.priceButton._elementRef.nativeElement.getBoundingClientRect().top + 'px',
        left: this.priceButton._elementRef.nativeElement.getBoundingClientRect().left + 'px'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedRange = result.selectedRange;
        this.fetchWorkshops();
      }
    });
  }

  public toggleBookmark(index: number) {
    if (!(this.workshops[index].bookmarks && this.workshops[index].bookmarks[0] && this.workshops[index].bookmarks[0].peer && this.workshops[index].bookmarks[0].peer[0] && this.workshops[index].bookmarks[0].peer[0].id === this.userId)) {
      this._collectionService.saveBookmark(this.workshops[index].id, (err, response) => {
        this.fetchData();
      });
    } else {
      this._collectionService.removeBookmark(this.workshops[index].bookmarks[0].id, (err, response) => {
        this.fetchData();
      });
    }
  }

  public filterClickedTopic(index) {
    this.availableTopics = _.cloneDeep(this.topicsBackup);
    this.availableTopics[index]['checked'] = true;
    this.fetchWorkshops();
  }
}
