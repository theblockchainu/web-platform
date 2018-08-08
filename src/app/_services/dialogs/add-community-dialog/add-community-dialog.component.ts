import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { MediaUploaderService } from '../../../_services/mediaUploader/media-uploader.service';
import * as _ from 'lodash';
import { environment } from '../../../../environments/environment';
import { LanguagePickerService } from '../../../_services/languagepicker/languagepicker.service';
import { Observable } from 'rxjs';
import { SearchService } from '../../search/search.service';
import { CommunityService } from '../../community/community.service';
import { startWith, map } from 'rxjs/operators';
@Component({
  selector: 'app-add-community-dialog',
  templateUrl: './add-community-dialog.component.html',
  styleUrls: ['./add-community-dialog.component.scss']
})
export class AddCommunityDialogComponent implements OnInit {

  communityForm: FormGroup;
  public uploadingVideo = false;
  public urlForVideo = [];
  public urlForImages = [];
  communityVideoPending: Boolean;
  communityImage1Pending: Boolean;
  communityImage2Pending: Boolean;
  public envVariable;
  public uploadingImage = false;
  public languagesArray: any[];
  filteredLanguageOptions: Observable<string[]>;
  public busyLanguage = false;
  freeCommunity = false;
  public currencies = [];
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
  public submitting: boolean;

  constructor(
    public dialogRef: MatDialogRef<AddCommunityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: FormBuilder,
    private mediaUploader: MediaUploaderService,
    private snackBar: MatSnackBar,
    private languagePickerService: LanguagePickerService,
    private searchService: SearchService,
    private communityService: CommunityService
  ) {
    this.envVariable = environment;
  }

  ngOnInit() {
    this.initialiseForm();
    this.languagePickerService.getLanguages()
      .subscribe((languages) => {
        this.languagesArray = _.map(languages, 'name');
        this.filteredLanguageOptions = this.communityForm.controls.selectedLanguage.valueChanges
          .pipe(
            startWith(null)
            , map(val => val ? this.filter(val) : this.languagesArray.slice())
          );
        console.log(this.filteredLanguageOptions);
      });

    this.communityVideoPending = true;
    this.communityImage1Pending = true;
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
    this.communityForm = this._fb.group(
      {
        type: [this.data.type ? this.data.type : ''],
        title: [this.data.title ? this.data.title : ''],
        stage: [this.data.stage ? this.data.stage : ''],
        language: [this.data.language ? this.data.language : ['']],
        headline: [this.data.headline ? this.data.headline : ''],
        description: [this.data.description ? this.data.description : ''],
        prerequisites: [this.data.prerequisites ? this.data.prerequisites : ''],
        videoUrls: [
          this.data.videoUrls ? this.data.videoUrls : ['']
        ],
        imageUrls: [
          this.data.imageUrls ? this.data.imageUrls : ['']
        ],
        price: [this.data.price ? this.data.price : 0],
        currency: [this.data.currency ? this.data.currency : ''],
        cancellationPolicy: [this.data.cancellationPolicy ? this.data.cancellationPolicy : ''],
        ageLimit: [this.data.ageLimit ? this.data.ageLimit : 0],
        notes: [this.data.notes ? this.data.notes : ''],
        status: [this.data.status ? this.data.status : 'active'],
        selectedLanguage: (this.data.language && this.data.language.length > 0) ? this.data.language[0] : ''
      });

    this.currencies = ['USD', 'INR', 'GBP'];

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

  uploadVideo(event) {
    this.uploadingVideo = true;
    for (const file of event.files) {
      this.mediaUploader.upload(file).subscribe((response: any) => {
        this.addVideoUrl(response.url);
        this.uploadingVideo = false;
      });
    }
  }

  public addVideoUrl(value: String) {
    console.log('Adding video url: ' + value);
    this.urlForVideo.push(value);
    const control = this.communityForm.controls['videoUrls'];
    this.communityVideoPending = false;
    control.patchValue(this.urlForVideo);
  }

  deleteFromContainerArr(event, fileType) {
    for (let i = 0; i < event.target.files.length; i++) {
      let file = event.target.files[i];
      const fileurl = file;
      file = _.replace(file, 'download', 'files');
      this.mediaUploader.delete(file)
        .subscribe((response : any) => {
          console.log(response);
          if (fileType === 'video') {
            this.urlForVideo = _.remove(this.urlForVideo, function (n) {
              return n !== fileurl;
            });
            this.communityForm.controls.videoUrls.patchValue(this.urlForVideo);
          } else if (fileType === 'image') {
            this.urlForImages = _.remove(this.urlForImages, function (n) {
              return n !== fileurl;
            });
            this.communityForm.controls.imageUrls.patchValue(this.urlForImages);
          }
        });
    }
  }

  deleteFromContainer(fileUrl, fileType) {
    const fileurl = fileUrl;
    fileUrl = _.replace(fileUrl, 'download', 'files');
    this.mediaUploader.delete(fileUrl)
      .subscribe((response : any) => {
        console.log(response);
        if (fileType === 'video') {
          this.urlForVideo = _.remove(this.urlForVideo, function (n) {
            return n !== fileurl;
          });
          this.communityForm.controls.videoUrls.patchValue(this.urlForVideo);
        } else if (fileType === 'image') {
          this.urlForImages = _.remove(this.urlForImages, function (n) {
            return n !== fileurl;
          });
          this.communityForm.controls.imageUrls.patchValue(this.urlForImages);
        }
      });

  }

  uploadImage(event) {
    this.uploadingImage = true;
    for (const file of event.files) {
      this.mediaUploader.upload(file).subscribe((response: any) => {
        this.addImageUrl(response.url);
        this.uploadingImage = false;
      }, err => {
        this.snackBar.open(err.message, 'Close', {
          duration: 5000
        });
        this.uploadingImage = false;
      });
    }
  }

  public addImageUrl(value: String) {
    console.log('Adding image url: ' + value);
    this.urlForImages.push(value);
    const control = <FormArray>this.communityForm.controls['imageUrls'];
    this.communityImage1Pending = false;
    control.patchValue(this.urlForImages);
  }

  filter(val: string): string[] {
    console.log('filtering');
    return this.languagesArray.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);
  }

  public languageChange(event) {
    this.busyLanguage = true;
    if (event) {
      console.log(event);
      this.busyLanguage = false;
      this.communityForm.controls['selectedLanguage'].patchValue(event);
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

  public submitInterests(communityId) {
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
    this.communityService.linkTopics(communityId, body).subscribe((res : any) => {
      this.submitting = false;
      this.dialogRef.close(true);
    }, err => {
      this.submitting = false;
      this.snackBar.open('Error', 'Close', { duration: 3000 });
    });
  }


  submitCommunity() {
    this.submitting = true;
    console.log('submitting community');
    const body = this.communityForm.value;
    body.language.pop();
    body.language.push(body.selectedLanguage);
    delete body.selectedLanguage;
    console.log(body);
    this.communityService.createCommunity(body).subscribe((res: any) => {
      this.submitInterests(res.id);
    });
  }

  public removed(event) {
    console.log('remove');
  }
}
