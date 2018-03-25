import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ConsoleAccountComponent} from '../console-account.component';

@Component({
  selector: 'app-console-account-privacy',
  templateUrl: './console-account-privacy.component.html',
  styleUrls: ['./console-account-privacy.component.scss']
})
export class ConsoleAccountPrivacyComponent implements OnInit {

  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleAccountComponent: ConsoleAccountComponent
  ) {
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleAccountComponent.setActiveTab(urlSegment[0].path);
    });
  }

  ngOnInit() {
  }

}
