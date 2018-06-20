import { Component, OnInit } from '@angular/core';
import { ConsoleTeachingComponent } from '../console-teaching.component';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../../../_services/profile/profile.service';
import { AccreditationService } from '../../../_services/accreditation/accreditation.service';
@Component({
  selector: 'app-console-teaching-accreditation',
  templateUrl: './console-teaching-accreditation.component.html',
  styleUrls: ['./console-teaching-accreditation.component.scss']
})
export class ConsoleTeachingAccreditationComponent implements OnInit {

  loaded: boolean;
  accreditationArray: Array<any>;
  public userId;

  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleTeachingComponent: ConsoleTeachingComponent,
    _cookieUtilsService: CookieUtilsService,
    private profileService: ProfileService) {
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
      this.accreditationArray = res;
      console.log(this.accreditationArray);
      this.loaded = true;
    });
  }

  cancelAccreditation(accreditation) {
    console.log('cancel');

  }
}
