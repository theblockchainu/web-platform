import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { MediaUploaderService } from '../../../_services/mediaUploader/media-uploader.service';
import * as _ from 'lodash';
import { environment } from '../../../../environments/environment';
import { LanguagePickerService } from '../../../_services/languagepicker/languagepicker.service';
import { Observable } from 'rxjs/Observable';
import { SearchService } from '../../search/search.service';
import { AccreditationService } from '../../accreditation/accreditation.service';

@Component({
  selector: 'app-create-accreditation-dialog',
  templateUrl: './create-accreditation-dialog.component.html',
  styleUrls: ['./create-accreditation-dialog.component.scss']
})
export class CreateAccreditationDialogComponent implements OnInit {
  accreditationForm: FormGroup;
  public envVariable;
  freeAccreditation = false;
  public interest1: FormGroup;
  public maxTopicMsg = 'Choose max 3 related topics';
  public interests = [];
  public suggestedTopics = [];
  public removedInterests = [];
  public relTopics = [];
  public searchTopicURL = '';
  public createTopicURL = '';
  public placeholderStringTopic = 'Search for a topic ';
  public maxTopics = 3;

  constructor(
    public dialogRef: MatDialogRef<CreateAccreditationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: FormBuilder,
    private mediaUploader: MediaUploaderService,
    private snackBar: MatSnackBar,
    private searchService: SearchService,
    private accreditationService: AccreditationService
  ) {
    this.envVariable = environment;

  }

  ngOnInit() {
    this.initialiseForm();
    this.searchTopicURL = environment.searchUrl + '/api/search/' + environment.uniqueDeveloperCode + '_topics/suggest?field=name&query=';
    this.createTopicURL = environment.apiUrl + '/api/' + environment.uniqueDeveloperCode + '_topics';
  }

  public selected(event) {
    if (event.length > 3) {
      this.maxTopicMsg = 'You cannot select more than 3 topics. Please delete any existing one and then try to add.';
    }
    this.interests = event;
    this.suggestedTopics = event;
    this.suggestedTopics.map((obj) => {
      obj.checked = 'true';
      return obj;
    });
  }

  private initialiseForm() {
    this.accreditationForm = this._fb.group({
      title: this.data.title ? this.data.title : '',
      description: this.data.description ? this.data.description : '',
      minimum_gyan: this.data.minimum_gyan ? this.data.minimum_gyan : '',
      fees: this.data.fees ? this.data.fees : ''
    });

    this.interest1 = new FormGroup({});

    if (this.interests.length === 0) {
      this.searchService.getTopics()
        .subscribe((response: any) => {
          this.suggestedTopics = response.slice(0, 5);
        });
    } else {
      this.suggestedTopics = this.interests;
    }
  }

  public changeInterests(topic: any) {
    const index = this.interests.indexOf(topic);
    if (index > -1) {
      this.interests.splice(index, 1); // If the user currently uses this topic, remove it.
    } else {
      this.interests.push(topic); // Otherwise add this topic.
    }
  }

  public submitInterests(accreditationId) {
    let body = {};
    let topicArray = [];
    this.interests.forEach((topic) => {
      topicArray.push(topic.id);
    });
    this.relTopics.forEach((topic) => {
      topicArray = _.without(topicArray, topic.id);
    });
    console.log(topicArray);
    body = {
      'targetIds': topicArray
    };
    this.accreditationService.linkTopics(accreditationId, body).subscribe((res) => {
      this.dialogRef.close(true);
      this.snackBar.open('Accreditation Created', 'close', { duration: 3000 });
    }, err => {
      this.snackBar.open('Error Occured', 'close', { duration: 3000 });
    });
  }


  submitAccreditation() {
    console.log('submitting accreditation');
    const body = this.accreditationForm.value;
    this.accreditationService.createAccreditation(body).subscribe((res: any) => {
      console.log(res);
      this.submitInterests(res.id);
    });
  }

  public removed(event) {
    console.log('remove');
  }
}
