import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CollectionService } from '../../../_services/collection/collection.service';
import { ConsoleTeachingComponent } from '../console-teaching.component';
import * as _ from 'lodash';
declare var moment: any;
import { MatDialog } from '@angular/material';
import { CohortDetailDialogComponent } from './cohort-detail-dialog/cohort-detail-dialog.component';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';
import { UcFirstPipe } from 'ngx-pipes';

@Component({
  selector: 'app-console-teaching-workshop',
  templateUrl: './console-teaching-workshop.component.html',
  styleUrls: ['./console-teaching-workshop.component.scss', '../console-teaching.component.scss', '../../console.component.scss'],
  providers: [UcFirstPipe]
})
export class ConsoleTeachingWorkshopComponent implements OnInit {

  public collections: any;
  public loaded: boolean;
  public now: Date;
  public userId;
  public drafts: Array<any>;
  public ongoingArray: Array<any>;
  public upcomingArray: Array<any>;
  public pastArray: Array<any>;
  public pastWorkshopsObject: any;
  public liveWorkshopsObject: any;
  public upcomingWorkshopsObject: any;

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
        consoleTeachingComponent.setActiveTab('workshops');
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
    this._collectionService.getOwnedCollections(this.userId, '{ "where": {"type":"workshop"}, "include": ["calendars", "owners", {"participants": ["reviewsAboutYou", "ownedCollections", "profiles"]}, "topics", {"contents":"schedules"}] }', (err, result) => {
      if (err) {
        console.log(err);
      } else {
        this.drafts = [];
        this.ongoingArray = [];
        this.upcomingArray = [];
        this.pastArray = [];
        this.pastWorkshopsObject = {};
        this.liveWorkshopsObject = {};
        this.upcomingWorkshopsObject = {};
        this.createOutput(result);
        this.now = new Date();
        this.loaded = true;
      }
    });
  }

  private createOutput(data: any) {
    const now = moment();
    data.forEach(workshop => {
      if (workshop.status === 'draft' || workshop.status === 'submitted' || workshop.calendars.length === 0) {
        workshop.itenaries = [];
        this.drafts.push(workshop);
      } else {
        workshop.itenaries = this._collectionService.calculateItenaries(workshop, workshop.calendars[0]);
        console.log(workshop);
        workshop.calendars.forEach(calendar => {
          calendar.startDate = moment(calendar.startDate).toDate();
          calendar.endDate = moment(calendar.endDate).hours(23).minutes(59).toDate();
          const startDateMoment = moment(calendar.startDate).toDate();
          const endDateMoment = moment(calendar.endDate).hours(23).minutes(59).toDate();
          if (endDateMoment) {
            if (now.diff(endDateMoment) < 0) {
              if (!now.isBetween(startDateMoment, endDateMoment)) {
                if (workshop.id in this.upcomingWorkshopsObject) {
                  this.upcomingWorkshopsObject[workshop.id]['workshop']['calendars'].push(calendar);
                } else {
                  this.upcomingWorkshopsObject[workshop.id] = {};
                  this.upcomingWorkshopsObject[workshop.id]['workshop'] = _.clone(workshop);
                  this.upcomingWorkshopsObject[workshop.id]['workshop']['calendars'] = [calendar];
                }
              } else {
                if (workshop.id in this.liveWorkshopsObject) {
                  this.liveWorkshopsObject[workshop.id]['workshop']['calendars'].push(calendar);
                } else {
                  this.liveWorkshopsObject[workshop.id] = {};
                  this.liveWorkshopsObject[workshop.id]['workshop'] = _.clone(workshop);
                  this.liveWorkshopsObject[workshop.id]['workshop']['calendars'] = [calendar];
                }
              }

            } else {
              if (workshop.id in this.pastWorkshopsObject) {
                this.pastWorkshopsObject[workshop.id]['workshop']['calendars'].push(calendar);
              } else {
                this.pastWorkshopsObject[workshop.id] = {};
                this.pastWorkshopsObject[workshop.id]['workshop'] = workshop;
                this.pastWorkshopsObject[workshop.id]['workshop']['calendars'] = [calendar];
                let participantReviewCount = 0;
                this.pastWorkshopsObject[workshop.id]['workshop'].participants.forEach(participant => {
                    if (participant.reviewsAboutYou && participant.reviewsAboutYou.some(reviews => reviews.collectionId === workshop.id)) {
                        participantReviewCount += 1;
                    }
                });
                this.pastWorkshopsObject[workshop.id]['workshop'].participantReviewCount = participantReviewCount;
              }
            }
          }
        });
      }
    });

    this.drafts.sort((a, b) => {
      return moment(b.updatedAt).diff(moment(a.updatedAt), 'days');
    });

    for (const key in this.pastWorkshopsObject) {
      if (this.pastWorkshopsObject.hasOwnProperty(key)) {
        this.pastWorkshopsObject[key].workshop.calendars.sort((a, b) => {
          return this.compareCalendars(a, b);
        });
        this.pastArray.push(this.pastWorkshopsObject[key].workshop);
      }
    }

    this.pastArray.sort((a, b) => {
      return moment(b.calendars[0].endDate).diff(moment(a.calendars[0].endDate), 'days');
    });

    for (const key in this.upcomingWorkshopsObject) {
      if (this.upcomingWorkshopsObject.hasOwnProperty(key)) {
        this.upcomingWorkshopsObject[key].workshop.calendars.sort((a, b) => {
          return this.compareCalendars(a, b);
        });
        this.upcomingArray.push(this.upcomingWorkshopsObject[key].workshop);
      }
    }

    this.upcomingArray.sort((a, b) => {
      return moment(a.calendars[0].startDate).diff(moment(b.calendars[0].startDate), 'days');
    });


    for (const key in this.liveWorkshopsObject) {
      if (this.liveWorkshopsObject.hasOwnProperty(key)) {
        this.ongoingArray.push(this.liveWorkshopsObject[key].workshop);
      }
    }
  }

  public onSelect(workshop) {
    this.router.navigate(['/workshop/', workshop.id, 'edit', workshop.stage ? workshop.stage : 1]);
  }

  public createWorkshop() {
    this._collectionService.postCollection(this.userId, 'workshop').subscribe((workshopObject: any) => {
      this.router.navigate(['workshop', workshopObject.id, 'edit', 1]);
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
