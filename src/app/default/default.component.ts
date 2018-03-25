import { Component, OnInit } from '@angular/core';
import { Router, Params, NavigationStart, ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';

@Component({
  template: `
    <router-outlet></router-outlet>
  `
})
export class DefaultComponent implements OnInit {
  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private cookieUtilService: CookieUtilsService) {
  }

  public ngOnInit() {
  }

}
