import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ConsoleAccountComponent} from '../console-account.component';
import {ProfileService} from '../../../_services/profile/profile.service';
import {CookieUtilsService} from '../../../_services/cookieUtils/cookie-utils.service';

@Component({
  selector: 'app-console-account-settings',
  templateUrl: './console-account-settings.component.html',
  styleUrls: ['./console-account-settings.component.scss']
})
export class ConsoleAccountSettingsComponent implements OnInit {

  public busyDeleteAccount = false;
  public loaded = true;
  public userId;

  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleAccountComponent: ConsoleAccountComponent,
    public _profileService: ProfileService,
    private _cookieUtilsService: CookieUtilsService
  ) {
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleAccountComponent.setActiveTab(urlSegment[0].path);
    });
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
  }

  public deleteAccount() {

  }

}
