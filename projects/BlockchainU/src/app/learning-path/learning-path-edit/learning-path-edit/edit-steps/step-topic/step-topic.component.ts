import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatStepper, MatSnackBar } from '@angular/material';
import { environment } from '../../../../../../environments/environment';
import * as _ from 'lodash';
import { Observable, merge, forkJoin } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { CollectionService } from '../../../../../_services/collection/collection.service';
import { Router } from '@angular/router';
import { TopicService } from '../../../../../_services/topic/topic.service';
import { SearchService } from '../../../../../_services/search/search.service';
import { EditService } from '../../edit-services/edit-services.service';
@Component({
  selector: 'app-step-topic',
  templateUrl: './step-topic.component.html',
  styleUrls: ['./step-topic.component.scss']
})
export class StepTopicComponent implements OnInit {

  @Input() topicArray: FormArray;
  @Input() stepper: MatStepper;

  @Output() exitWizard = new EventEmitter<boolean>();

  busyInterest = false;
  selectedTopic: FormGroup;
  newTopic: FormGroup;
  maxTopicMsg = 'Choose max 5 relevant topics';
  interests: Array<any>;
  suggestedTopics = [];
  searchTopicURL = '';
  createTopicURL = '';
  placeholderStringTopic = 'Search for a topic ';
  maxTopics = 5;
  busySavingData: boolean;
  removedInterests = [];
  relTopics = [];
  exitAfterSave = false;

  constructor(
    private _collectionService: CollectionService,
    private router: Router,
    private _topicService: TopicService,
    private _fb: FormBuilder,
    private searchService: SearchService,
    private _editService: EditService,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnInit() {
    console.log(this.topicArray.value);
    this.interests = this.topicArray.value;
    this.searchTopicURL = environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics/suggest?field=name&query=';
    this.createTopicURL = environment.apiUrl + '/api/topics';

    this.newTopic = this._fb.group({
      topicName: ['', Validators.required]
    });

    this.placeholderStringTopic = 'Start typing to to see a list of suggested topics...';

    if (!this.interests || this.interests.length === 0) {
      this.searchService.getTopics().subscribe((response: any) => {
        this.suggestedTopics = response.slice(0, 5);
      });
    } else {
      this.suggestedTopics = this.interests;
    }

    if (this.interests) {
      this.suggestedTopics = _.cloneDeep(this.interests);
    }

  }

  selected(event) {
    if (event.length > 3) {
      this.maxTopicMsg = 'You cannot select more than 3 topics. Please delete any existing one and then try to add.';
    }
    this.interests = event;
    console.log(this.interests);
    this.suggestedTopics = event;
    this.suggestedTopics.map((obj) => {
      obj.checked = 'true';
      return obj;
    });
  }

  initializeFormValues(res: any) {
    // Topics
    this.relTopics = _.uniqBy(res.topics, 'id');
    const arra = [];
    this.interests = this.relTopics;
    if (this.interests) {
      this.suggestedTopics = _.cloneDeep(this.interests);
    }
    this.selectedTopic = new FormGroup({});

  }

  public submitInterests() {
    console.log(this.interests);
    if (this.interests.length < 1 && this.topicArray.valid) {
      console.log('next step');
      this.stepper.next();
    } else {
      this.busySavingData = true;
      let body = {};
      const topicArray = [];
      this.interests.forEach((topic) => {
        topicArray.push(topic.id);
      });
      body = {
        'targetIds': topicArray
      };
      console.log(body);
      if (topicArray.length !== 0) {
        console.log(this.topicArray.value);
        if (this.topicArray.value.length > 0) {
          const unlinkObeservables: Array<Observable<ArrayBuffer>> = [];
          this.topicArray.value.forEach(interest => {
            console.log('unlinking ' + interest.id);
            unlinkObeservables.push(this._collectionService.unlinkTopic(this._editService.learningPathId, interest.id));
          });
          const finalObservable = forkJoin(...unlinkObeservables);
          finalObservable.pipe(
            flatMap(res => {
              console.log('unlinked eveything');
              return this._collectionService.linkTopics(this._editService.learningPathId, body);
            })
          ).subscribe((res: any) => {
            console.log('Linked new');
            this.busySavingData = false;
            this.stepper.next();
          });
        } else {
          console.log('linking topics');
          this._collectionService.linkTopics(this._editService.learningPathId, body).subscribe((res: any) => {
            this.busySavingData = false;
            console.log('topics linked');
            this.stepper.next();
          });
        }
      } else {
        if (this.topicArray.valid) {
          this.stepper.next();
        } else {
          this.matSnackBar.open('Please select topics', 'Close', { duration: 3000 });
        }
      }
    }

  }

  changeInterests(topic: any) {
    const index = this.interests.indexOf(topic);
    if (index > -1) {
      this.interests.splice(index, 1); // If the user currently uses this topic, remove it.
    } else {
      this.interests.push(topic); // Otherwise add this topic.
    }
  }

}
