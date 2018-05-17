import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-knowledge-story',
  templateUrl: './knowledge-story.component.html',
  styleUrls: ['./knowledge-story.component.scss']
})
export class KnowledgeStoryComponent implements OnInit {
  loadingScholarship: boolean;
  userId: string;
  initialised = false;
  accountApproved: string;
  storyId: string;
  knowledgeStory: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _cookieUtilsService: CookieUtilsService,
    private router: Router,
    private dialogsService: DialogsService,
    private matSnackBar: MatSnackBar
  ) {
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe(params => {
      if (this.initialised && (this.storyId !== params['storyId'])) {
        location.reload();
      }
      this.storyId = params['scholarshipId'];
    });
    this.userId = this._cookieUtilsService.getValue('userId');
    this.initialised = true;
    this.initializePage();
    this.accountApproved = this._cookieUtilsService.getValue('accountApproved');
  }

  initializePage() {
    
  }

}
