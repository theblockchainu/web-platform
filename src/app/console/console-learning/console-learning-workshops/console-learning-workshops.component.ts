import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleLearningComponent } from '../console-learning.component';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';

declare var moment: any;
import * as _ from 'lodash';


@Component({
  selector: 'app-console-learning-workshops',
  templateUrl: './console-learning-workshops.component.html',
  styleUrls: ['./console-learning-workshops.component.scss', '../../console.component.scss']
})
export class ConsoleLearningWorkshopsComponent implements OnInit {

  public collections: any;
  public loaded: boolean;
  public now: Date;
  private outputResult: any;
  public activeTab: string;
  public userId;

  public ongoingArray: Array<any>;
  public upcomingArray: Array<any>;
  public pastArray: Array<any>;
  public pastWorkshopsObject: any;
  public liveWorkshopsObject: any;
  public upcomingWorkshopsObject: any;


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
      if (urlSegment[0] === undefined) {
        consoleLearningComponent.setActiveTab('workshops');
      } else {
        console.log(urlSegment[0].path);
        consoleLearningComponent.setActiveTab(urlSegment[0].path);
      }
    });
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.loaded = false;
    this.fetchWorkshop();
  }

  private fetchWorkshop() {
    this._collectionService.getParticipatingCollections(this.userId, '{ "relInclude": "calendarId", "where": {"type":"workshop"}, "include": ["calendars", {"owners":["profiles", "reviewsAboutYou", "ownedCollections"]}, {"participants": "profiles"}, "topics", {"contents":["schedules","views","submissions"]}, {"reviews":"peer"}] }', (err, result) => {
      if (err) {
        console.log(err);
      } else {
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
      workshop.calendars.forEach(calendar => {
        if (workshop.calendarId === calendar.id && calendar.endDate) {
          if (now.diff(moment.utc(calendar.endDate)) < 0) {
            if (!now.isBetween(calendar.startDate, calendar.endDate)) {
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
            }
          }
        }
      });
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

  public compareCalendars(a, b) {
    return moment(a.startDate).diff(moment(b.startDate), 'days');
  }
  public onSelect(workshop) {
    this.router.navigate(['workshop', workshop.id, 'edit', 1]);
  }

  public exitWorkshop(collection: any) {
    this._dialogService.openExitCollection(collection.id, this.userId).subscribe(result => {
      if (result) {
        this.fetchWorkshop();
        this.snackBar.open('You have dropped out of the ' + collection.type, 'Close', {
          duration: 800
        });
      } else {
        console.log(result);
      }
    });
  }
  public openCollection(collection: any) {
    this.router.navigateByUrl('/workshop/' + collection.id + '/calendar/' + collection.calendarId);
  }

  public viewTransaction(collection: any) {
    this.router.navigate(['console', 'account', 'transactions']);
  }

  public openProfile(peer: any) {
    this.router.navigate(['profile', peer.id]);
  }

}
