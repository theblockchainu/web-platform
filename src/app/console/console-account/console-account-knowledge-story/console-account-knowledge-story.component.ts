import { Component, OnInit } from '@angular/core';
import { ConsoleAccountComponent } from '../console-account.component';
import { ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { KnowledgeStoryService } from '../../../_services/knowledge-story/knowledge-story.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-console-account-knowledge-story',
  templateUrl: './console-account-knowledge-story.component.html',
  styleUrls: ['./console-account-knowledge-story.component.scss']
})
export class ConsoleAccountKnowledgeStoryComponent implements OnInit {
  private userId: string;
  public storiesYouRequested: Array<any>;
  public storiesGenerated: Array<any>;
  public storiesOthersRequested: Array<any>;

  constructor(
    public consoleAccountComponent: ConsoleAccountComponent,
    public activatedRoute: ActivatedRoute,
    private _cookieUtilsService: CookieUtilsService,
    private _dialogsService: DialogsService,
    private _matSnackBar: MatSnackBar,
    private _KnowledgeStoryService: KnowledgeStoryService
  ) {
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleAccountComponent.setActiveTab(urlSegment[0].path);
    });
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.fetchstoriesYouRequested();
    this.fetchstoriesOthersRequested();
  }

  fetchstoriesYouRequested() {
    const filter = {
      'include': [{ 'protagonist': 'profiles' }, 'topics']
    };
    this._KnowledgeStoryService.getavailableKnowledgeStories(this.userId, filter)
      .subscribe((res: any) => {
        this.storiesYouRequested = res;
        console.log(this.storiesYouRequested);
      });
  }

  fetchstoriesOthersRequested() {
    const filter = {
      'include': [{ 'peer': 'profiles' }, 'topics']
    };
    this._KnowledgeStoryService.getknowledgeStoryRequests(this.userId, filter).subscribe((res: any) => {
      this.storiesOthersRequested = res;
      console.log(this.storiesOthersRequested);
    });
  }

  approve(storyId: string) {
    this._KnowledgeStoryService.patchKnowledgeStoryRequests(storyId, {
      'status': 'approved'
    }).subscribe((res: any) => {
      this.fetchstoriesOthersRequested();
    });
  }

  reject(storyId: string) {
    this._KnowledgeStoryService.patchKnowledgeStoryRequests(storyId, {
      'status': 'rejected'
    }).subscribe((res: any) => {
      this.fetchstoriesOthersRequested();
    });
  }
}
