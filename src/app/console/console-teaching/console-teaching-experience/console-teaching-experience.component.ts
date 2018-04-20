import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CollectionService } from '../../../_services/collection/collection.service';
import { ConsoleTeachingComponent } from '../console-teaching.component';
import * as _ from 'lodash';
declare var moment: any;
import { MatDialog } from '@angular/material';
import { CohortDetailDialogComponent } from '../console-teaching-workshop/cohort-detail-dialog/cohort-detail-dialog.component';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';
import { UcFirstPipe } from 'ngx-pipes';

@Component({
  selector: 'app-console-teaching-experience',
  templateUrl: './console-teaching-experience.component.html',
  styleUrls: ['./console-teaching-experience.component.scss', '../console-teaching.component.scss', '../../console.component.scss'],
  providers: [UcFirstPipe]
})
export class ConsoleTeachingExperienceComponent implements OnInit {

  public collections: any;
  public loaded: boolean;
  public now: Date;
  public userId;
  public drafts: Array<any>;
  public ongoingArray: Array<any>;
  public upcomingArray: Array<any>;
  public pastArray: Array<any>;
  public pastExperiencesObject: any;
  public liveExperiencesObject: any;
  public upcomingExperiencesObject: any;

  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleTeachingComponent: ConsoleTeachingComponent,
    public _collectionService: CollectionService,
    private _cookieUtilsService: CookieUtilsService,
    private _dialogService: DialogsService,
    public router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private ucFirstPipe: UcFirstPipe
  ) {
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      if (urlSegment[0] === undefined) {
        consoleTeachingComponent.setActiveTab('experiences');
      } else {
        consoleTeachingComponent.setActiveTab(urlSegment[0].path);
      }
    });
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.loaded = false;
    this.fetchData();
  }

  private fetchData() {
    this._collectionService.getOwnedCollections(this.userId,
      '{ "where": {"type":"experience"}, "include": ["calendars", "owners",' +
      ' {"participants": ["reviewsAboutYou", "ownedCollections", "profiles"]}, "topics", ' +
      '{"contents":"schedules"}] }', (err, result) => {
        if (err) {
          console.log(err);
        } else {
          this.drafts = [];
          this.ongoingArray = [];
          this.upcomingArray = [];
          this.pastArray = [];
          this.pastExperiencesObject = {};
          this.liveExperiencesObject = {};
          this.upcomingExperiencesObject = {};
          this.createOutput(result);
          this.now = new Date();
          this.loaded = true;
        }
      });
  }

  private createOutput(data: any) {
    const now = moment();
    data.forEach(experience => {
      if (experience.status === 'draft' || experience.status === 'submitted' || experience.calendars.length === 0) {
        experience.itenaries = [];
        this.drafts.push(experience);
      } else {
        experience.itenaries = this._collectionService.calculateItenaries(experience, experience.calendars[0]);
        console.log(experience);
        experience.calendars.forEach(calendar => {
          calendar.startDate = moment(calendar.startDate).toDate();
          calendar.endDate = moment(calendar.endDate).hours(23).minutes(59).toDate();
          const startDateMoment = moment(calendar.startDate).toDate();
          const endDateMoment = moment(calendar.endDate).hours(23).minutes(59).toDate();
          if (endDateMoment) {
            if (now.diff(endDateMoment) < 0) {
              if (!now.isBetween(startDateMoment, endDateMoment)) {
                if (experience.id in this.upcomingExperiencesObject) {
                  this.upcomingExperiencesObject[experience.id]['experience']['calendars'].push(calendar);
                } else {
                  this.upcomingExperiencesObject[experience.id] = {};
                  this.upcomingExperiencesObject[experience.id]['experience'] = _.clone(experience);
                  this.upcomingExperiencesObject[experience.id]['experience']['calendars'] = [calendar];
                }
              } else {
                if (experience.id in this.liveExperiencesObject) {
                  this.liveExperiencesObject[experience.id]['experience']['calendars'].push(calendar);
                } else {
                  this.liveExperiencesObject[experience.id] = {};
                  this.liveExperiencesObject[experience.id]['experience'] = _.clone(experience);
                  this.liveExperiencesObject[experience.id]['experience']['calendars'] = [calendar];
                }
              }

            } else {
              if (experience.id in this.pastExperiencesObject) {
                this.pastExperiencesObject[experience.id]['experience']['calendars'].push(calendar);
              } else {
                this.pastExperiencesObject[experience.id] = {};
                this.pastExperiencesObject[experience.id]['experience'] = experience;
                this.pastExperiencesObject[experience.id]['experience']['calendars'] = [calendar];
                let participantReviewCount = 0;
                this.pastExperiencesObject[experience.id]['experience'].participants.forEach(participant => {
                  if (participant.reviewsAboutYou && participant.reviewsAboutYou.some(reviews => reviews.collectionId === experience.id)) {
                    participantReviewCount += 1;
                  }
                });
                this.pastExperiencesObject[experience.id]['experience'].participantReviewCount = participantReviewCount;
              }
            }
          }
        });
      }
    });

    this.drafts.sort((a, b) => {
      return moment(b.updatedAt).diff(moment(a.updatedAt), 'days');
    });

    for (const key in this.pastExperiencesObject) {
      if (this.pastExperiencesObject.hasOwnProperty(key)) {
        this.pastExperiencesObject[key].experience.calendars.sort((a, b) => {
          return this.compareCalendars(a, b);
        });
        this.pastArray.push(this.pastExperiencesObject[key].experience);
      }
    }

    this.pastArray.sort((a, b) => {
      return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
    });

    for (const key in this.upcomingExperiencesObject) {
      if (this.upcomingExperiencesObject.hasOwnProperty(key)) {
        this.upcomingExperiencesObject[key].experience.calendars.sort((a, b) => {
          return this.compareCalendars(a, b);
        });
        this.upcomingArray.push(this.upcomingExperiencesObject[key].experience);
      }
    }

    this.upcomingArray.sort((a, b) => {
      return moment(a.calendars[0].startDate).diff(moment(b.calendars[0].startDate), 'days');
    });


    for (const key in this.liveExperiencesObject) {
      if (this.liveExperiencesObject.hasOwnProperty(key)) {
        this.ongoingArray.push(this.liveExperiencesObject[key].experience);
      }
    }
  }

  public onSelect(experience) {
    this.router.navigate(['/experience/', experience.id, 'edit', experience.stage ? experience.stage : 1]);
  }

  public createExperience() {
    this._collectionService.postCollection(this.userId, 'experience').subscribe((experienceObject: any) => {
      this.router.navigate(['experience', experienceObject.id, 'edit', 1]);
    });
  }

  /**
   * compareCalendars
   */
  public compareCalendars(a, b) {
    return moment(a.startDate).diff(moment(b.startDate), 'days');
  }

  public openCohortDetailDialog(cohortData: any, status) {
    cohortData['status'] = status;
    const dialogRef = this.dialog.open(CohortDetailDialogComponent, {
      width: '45vw',
      data: cohortData,
			panelClass: 'responsive-dialog',
      
    });
  }

  public deleteCollection(collection: any) {
    this._dialogService.openDeleteCollection(collection).subscribe(result => {
      if (result) {
        this.fetchData();
        this.snackBar.open(this.ucFirstPipe.transform(collection.type) + ' Deleted', 'Close', {
          duration: 5000
        });
      }
    });
  }

  /**
   * cancelCollection
collection:any     */
  public cancelCollection(collection: any) {
    this._dialogService.openCancelCollection(collection).subscribe(result => {
      if (result) {
        this.fetchData();
        this.snackBar.open(this.ucFirstPipe.transform(collection.type) + ' Cancelled', 'Close', {
          duration: 5000
        });
      }
    });
  }

}
