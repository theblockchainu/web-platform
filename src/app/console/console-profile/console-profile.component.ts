import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CollectionService } from '../../_services/collection/collection.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { ConsoleComponent } from '../console.component';

declare var moment: any;


@Component({
  selector: 'app-console-profile',
  templateUrl: './console-profile.component.html',
  styleUrls: ['./console-profile.component.scss', '../console.component.scss']
})
export class ConsoleProfileComponent implements OnInit {

  public userId;
  public classes: any;
  public loaded: boolean;
  public activeTab: string;
  private profileId;

  constructor(
    private activatedRoute: ActivatedRoute,
    public router: Router,
    public _collectionService: CollectionService,
    public consoleComponent: ConsoleComponent,
    public _profileService: ProfileService,
    private _cookieUtilsService: CookieUtilsService) {
    activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleComponent.setActiveTab(urlSegment[0].path);
    });
    this.userId = _cookieUtilsService.getValue('userId');

    this.activeTab = 'edit';
  }

  ngOnInit() {
    this.loaded = false;
  }

  /**
   * createClass
   */
  public viewProfile() {
    this.router.navigate(['profile', this.userId]);
  }

  /**
   * Check if the given tab is active tab
   * @param tabName
   * @returns {boolean}
   */
  public getActiveTab() {
    return this.activeTab;
  }

  /**
   * Set value of activeTab
   * @param value
   */
  public setActiveTab(value) {
    this.activeTab = value;
  }

  imgErrorHandler(event) {
      event.target.src = '/assets/images/user-placeholder.jpg';
  }

}
