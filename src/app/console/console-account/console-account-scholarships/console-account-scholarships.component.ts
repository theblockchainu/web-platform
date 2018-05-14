import { Component, OnInit } from '@angular/core';
import { ConsoleAccountComponent } from '../console-account.component';
import { ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { ScholarshipService } from '../../../_services/scholarship/scholarship.service';

@Component({
  selector: 'app-console-account-scholarships',
  templateUrl: './console-account-scholarships.component.html',
  styleUrls: ['./console-account-scholarships.component.scss']
})
export class ConsoleAccountScholarshipsComponent implements OnInit {

  private userId: string;
  public scholarshipsLoaded: boolean;
  public scholarships: Array<any>;
  constructor(
    public consoleAccountComponent: ConsoleAccountComponent,
    public activatedRoute: ActivatedRoute,
    private _cookieUtilsService: CookieUtilsService,
    private _scholarshipService: ScholarshipService
  ) {
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleAccountComponent.setActiveTab(urlSegment[0].path);
    });
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.fetchScholarships();
  }

  private fetchScholarships() {
    const filter = { 'include': [{ 'owner': 'profiles' }, 'peers_joined', 'allowed_collections'] };
    this._scholarshipService.fetchUserScholarships(filter).subscribe((res: any) => {
      this.scholarships = res;
      this.scholarshipsLoaded = true;
      console.log(this.scholarships);
    }, err => {
      this.scholarshipsLoaded = true;
    });
  }

}
