import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import { ProfileService } from '../../profile/profile.service';
import { QuestionService } from '../../question/question.service';
import { SearchService } from '../../search/search.service';
import { environment } from '../../../../environments/environment';
import { MatSnackBar, MatDialogRef } from '@angular/material';
import { flatMap } from 'rxjs/operators';
import { pipe } from 'rxjs';
import * as _ from 'lodash';
import { CollectionService } from '../../collection/collection.service';
import { TopicService } from '../../topic/topic.service';

@Component({
  selector: 'app-ask-question-dialog',
  templateUrl: './ask-question-dialog.component.html',
  styleUrls: ['./ask-question-dialog.component.scss']
})
export class AskQuestionDialogComponent implements OnInit {

  private userId: string;
  questionForm: FormGroup;
  private questionHasQuestionMark: boolean;
  public loggedInUser: any;
  public loadingUser: boolean;
  public gyanBalance: number;
  public busyQuestion: boolean;
  public interests = [];
  public suggestedTopics: Array<any>;
  public searchTopicURL = '';
  public createTopicURL = '';
  public placeholderStringTopic = 'Search for a topic ';
  public maxTopics = 3;
  public interest1: FormGroup;
  public selectedCommunities: Array<CommunityObject>;
  public myControl = new FormControl('');
  public searchOptions: Array<any>;
  public envVariable: any;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  public searchingCommunity: boolean;

  @ViewChild('communityInput') communityInput: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<AskQuestionDialogComponent>,
    private _fb: FormBuilder,
    private cookieUtilsService: CookieUtilsService,
    public _profileService: ProfileService,
    private questionService: QuestionService,
    private searchService: SearchService,
    private matSnackBar: MatSnackBar,
    public collectionService: CollectionService,
    private topicService: TopicService
  ) {
  }

  ngOnInit() {
    this.userId = this.cookieUtilsService.getValue('userId');
    this.loadingUser = true;
    this.searchTopicURL = environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics/suggest?field=name&query=';
    this.createTopicURL = environment.apiUrl + '/api/' + environment.uniqueDeveloperCode + '_topics';
    this.envVariable = environment;
    this.initialiseForms();
    this.getLoggedInUser();
    this.getGyanBalance();
  }

  private getGyanBalance() {
    if (this.userId && this.userId.length > 5) {
      this._profileService.getGyanBalance(this.userId, 'fixed').subscribe((res: any) => {
        this.gyanBalance = parseInt(res, 10);
        if (this.gyanBalance === 0) {
          this.questionForm.controls['gyan'].disable();
        }
      });
    } else {
      this.gyanBalance = 0;
      this.questionForm.controls['gyan'].disable();
    }
  }

  private getLoggedInUser() {
    this._profileService.getPeerData(this.userId, { 'include': ['profiles', 'reviewsAboutYou', 'ownedCollections', 'scholarships_joined'] }).subscribe(res => {
      this.loggedInUser = res;
      this.loadingUser = false;
    });
  }

  initialiseForms() {
    this.questionForm = this._fb.group({
      text: ['', Validators.required],
      gyan: ['1', [Validators.required, Validators.min(1)]],
      scholarshipId: ['NA']
    });

    this.questionForm.controls.text.valueChanges.subscribe(value => {
      if (value) {
        if (value.substring(value.length - 1) !== '?' && value.substring(value.length - 2, value.length - 1) !== '?' && !this.questionHasQuestionMark) {
          this.questionHasQuestionMark = true;
          console.log(value);
          this.questionForm.controls.text.patchValue(value + '?');
        } else if (value.substring(value.length - 1) !== '?' && value.substring(value.length - 2, value.length - 1) !== '?' && this.questionHasQuestionMark) {
          this.questionForm.controls.text.setValue(value.substring(0, value.length - 1) + '?');
        } else if (value.substring(value.length - 1) !== '?' && value.substring(value.length - 2, value.length - 1) === '?') {
          this.questionForm.controls.text.setValue(value.substring(0, value.length - 2) + value.substring(value.length - 1) + '?');
        }
      }
    });

    this.interest1 = new FormGroup({});

    this.selectedCommunities = [];

    this.myControl.valueChanges.pipe(flatMap((value) => {
      this.searchingCommunity = true;
      return this.searchService.searchForCommunities(value);
    })).subscribe((res: any) => {
      this.searchOptions = res;
      this.searchingCommunity = false;
    }, err => {
      console.log(err);
    });

    const filter = {
      'limit': 3
    }
    this.topicService.getTopics(filter).subscribe(res => {
      console.log('topics');
      console.log(res);
      this.suggestedTopics = res;
    });
  }

  removeCommunity(community: any): void {
    const index = this.selectedCommunities.indexOf(community);
    if (index >= 0) {
      this.selectedCommunities.splice(index, 1);
    }
  }

  onSearchOptionClicked(event: any): void {
    const data = event.option.value;
    this.selectedCommunities.push({
      id: data.id,
      title: data.title
    });
    this.communityInput.nativeElement.value = '';
  }

  /**
     * post question
     */
  public postQuestion() {
    this.busyQuestion = true;
    if (this.userId && this.userId.length > 5) {
      if (this.questionForm.valid && (this.questionForm.controls['gyan'].value <= this.gyanBalance || this.questionForm.controls['gyan'].disabled)) {
        // If user has a scholarship, make sure the scholarship is used for karma burn.
        if (this.loggedInUser.scholarships_joined && this.loggedInUser.scholarships_joined.length > 0) {
          this.questionForm.controls['scholarshipId'].patchValue(this.loggedInUser.scholarships_joined[0].id);
        }
        // If gyan balance is 0, make the gyan amount 1.
        if (this.gyanBalance === 0) {
          this.questionForm.controls['gyan'].patchValue(1);
          this.questionForm.value['gyan'] = 1;
        }
        let questionId;
        this.questionService.postQuestion(this.userId, this.questionForm.value).pipe(
          flatMap((res: any) => {
            questionId = res.id;
            return this.submitInterests(questionId);
          }), flatMap((res: any) => {
            return this.submitCommunities(questionId);
          })
        ).subscribe((result: any) => {
          this.questionForm.reset();
          this.busyQuestion = false;
          this.dialogRef.close(true);
        },
          err => {
            this.matSnackBar.open('An Error occurred', 'close', { duration: 3000 });
            console.log(err);
          });
      } else {
        this.matSnackBar.open('Check if you have enough gyan balance in your account for this question.', 'Ok', { duration: 5000 });
      }
    } else {
      console.log('log in');
    }
  }

  private submitCommunities(questionId) {
    let body = {};
    let communitiesArray = [];
    const relTopics = [];
    this.selectedCommunities.forEach((community) => {
      communitiesArray.push(community.id);
    });
    relTopics.forEach((topic) => {
      communitiesArray = _.without(communitiesArray, topic.id);
    });
    body = {
      'targetIds': communitiesArray
    };
    console.log(questionId);
    console.log(body);

    return this.questionService.linkCommunities(questionId, body);
  }

  public selected(event) {
    if (event.length > 3) {
      this.matSnackBar.open('Cannot select more than 3 topics', 'close', { duration: 3000 });
    } else {
      this.interests = event;
      this.suggestedTopics = event;
      this.suggestedTopics.map((obj) => {
        obj.checked = 'true';
        return obj;
      });
    }

  }

  public removed(event) {
    console.log('remove');
  }

  public submitInterests(questionId) {
    let body = {};
    let topicArray = [];
    const relTopics = [];
    this.interests.forEach((topic) => {
      topicArray.push(topic.id);
    });
    relTopics.forEach((topic) => {
      topicArray = _.without(topicArray, topic.id);
    });
    body = {
      'targetIds': topicArray
    };
    return this.questionService.linkTopics(questionId, body);
  }

}

interface CommunityObject {
  id: string;
  title: string;
}
