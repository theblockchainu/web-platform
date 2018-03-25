import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleLearningComponent } from '../console-learning.component';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../../../_services/profile/profile.service';
import * as moment from 'moment';
import { DialogsService } from '../../../_services/dialogs/dialog.service';

@Component({
  selector: 'app-console-learning-sessions',
  templateUrl: './console-learning-sessions.component.html',
  styleUrls: ['./console-learning-sessions.component.scss', '../../console.component.scss']
})
export class ConsoleLearningSessionsComponent implements OnInit {

  public loaded: boolean;
  public activeTab: string;
  public userId;
  public pastSessions = [];
  public ongoingSessions = [];
  public upcomingSessions = [];
  public notApproved = [];
  public participant: any;
  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleLearningComponent: ConsoleLearningComponent,
    public _collectionService: CollectionService,
    public router: Router,
    private _cookieUtilsService: CookieUtilsService,
    public _profileService: ProfileService,
    private dialogsService: DialogsService
  ) {
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleLearningComponent.setActiveTab(urlSegment[0].path);
    });
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.loaded = false;
    const filter = {
      'include': [
        {
          'contents': [
            'availabilities',
            { 'collections': [{ 'owners': 'profiles' }] }
          ]
        },
        'profiles'
      ]
    };

    this._profileService.getPeerData(this.userId, filter).subscribe(res => {
      this.participant = res;
      this.filterSessions(res.contents);
    });
  }

  private filterSessions(contents: Array<any>) {
    contents.forEach(element => {
      const availabilities = element.availabilities.sort((calEventa, calEventb) => (moment(calEventa.startDateTime).isAfter(moment(calEventb.startDateTime)) ? 1 : -1));
      console.log(availabilities);
      const startTime = moment(availabilities[0].startDateTime).local();
      const endTime = moment(availabilities[availabilities.length - 1].startDateTime).local().add(30, 'minutes');
      const now = moment();
      element.startTime = startTime.toDate();
      element.endTime = endTime.toDate();
      if (element.sessionIsApproved) {
        if (now.isBetween(startTime, endTime)) {
          this.ongoingSessions.push(element);
        } else if (now.isBefore(startTime)) {
          this.upcomingSessions.push(element);
        } else {
          this.pastSessions.push(element);
        }
      } else {
        this.notApproved.push(element);
      }
    });
    this.loaded = true;
  }

  public getEndTime(time: string): string {
    return moment(time).add(30, 'minutes').toISOString();
  }

  /**
 * joinLiveSession
 */
  public joinLiveSession(session: any) {
    const data = {
      roomName: session.id,
      teacher: session.collections[0].owners[0],
      content: session,
      participants: [this.participant]
    };
    this.dialogsService.startLiveSession(data).subscribe(result => {
    });
  }
}
