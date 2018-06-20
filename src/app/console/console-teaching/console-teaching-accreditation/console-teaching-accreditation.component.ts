import { Component, OnInit } from '@angular/core';
import { ConsoleTeachingComponent } from '../console-teaching.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../../../_services/profile/profile.service';
import { AccreditationService } from '../../../_services/accreditation/accreditation.service';
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-console-teaching-accreditation',
  templateUrl: './console-teaching-accreditation.component.html',
  styleUrls: ['./console-teaching-accreditation.component.scss']
})
export class ConsoleTeachingAccreditationComponent implements OnInit {

  loadedCreatedAccreditations: boolean;
  loadedSubscribedAccreditations: boolean;

  accreditationsCreatedArray: Array<any>;
  accreditationsSubscribedArray: Array<any>;

  public userId;

  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleTeachingComponent: ConsoleTeachingComponent,
    _cookieUtilsService: CookieUtilsService,
    private profileService: ProfileService,
    private accreditationService: AccreditationService,
    private matSnackBar: MatSnackBar) {
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      if (urlSegment[0] === undefined) {
        consoleTeachingComponent.setActiveTab('accreditation');
      } else {
        consoleTeachingComponent.setActiveTab(urlSegment[0].path);
      }
    });
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.fetchAccreditations();
    this.consoleTeachingComponent.accreditationSubject.subscribe(res => {
      this.fetchAccreditations();
    });
  }

  fetchAccreditations() {
    const filter = {
      'include': [{ 'subscribedBy': ['reviewsAboutYou', 'ownedCollections', 'profiles'] }, 'topics']
    };
    this.profileService.getAccreditationsCreated(this.userId, filter).subscribe((res: any) => {
      this.accreditationsCreatedArray = res;
      console.log(this.accreditationsCreatedArray);
      this.loadedCreatedAccreditations = true;
    });

    this.profileService.getAccreditationsSubscribed(this.userId, filter).subscribe((res: any) => {
      this.accreditationsCreatedArray = res;
      console.log(this.accreditationsCreatedArray);
      this.loadedSubscribedAccreditations = true;
    });

  }

  cancelAccreditation(accreditationId) {
    console.log('cancel');
    this.accreditationService.deleteAccreditation(accreditationId).subscribe(res => {
      this.matSnackBar.open('Accreditation Deleted', 'Close', { duration: 3000 });
      this.fetchAccreditations();
    });
  }

  leaveAccreditation(accreditationId) {
    console.log('leave');
    this.accreditationService.leaveAccreditation(this.userId, accreditationId).subscribe(res => {
      this.matSnackBar.open('Accreditation Left', 'Close', { duration: 3000 });
      this.fetchAccreditations();
    });
  }
}
