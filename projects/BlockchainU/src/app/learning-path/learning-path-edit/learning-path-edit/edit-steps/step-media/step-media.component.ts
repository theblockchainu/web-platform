import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { MediaUploaderService } from '../../../../../_services/mediaUploader/media-uploader.service';
import { MatSnackBar, MatStepper } from '@angular/material';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { EditService } from '../../edit-services/edit-services.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-step-media',
  templateUrl: './step-media.component.html',
  styleUrls: ['./step-media.component.scss']
})
export class StepMediaComponent implements OnInit {


  @Input() mediaForm: FormGroup;
  @Input() stepper: MatStepper;
  busySavingData: boolean;

  envVariable: any;

  urlForImages = [];
  urlForVideo = [];
  uploadingImage = false;
  profileImagePending: Boolean;
  mediaFormVideoPending: Boolean;
  mediaFormImage1Pending: Boolean;
  mediaFormImage2Pending: Boolean;
  uploadingVideo = false;

  constructor(
    private mediaUploader: MediaUploaderService,
    private snackBar: MatSnackBar,
    private editService: EditService,
    private matSnackBar: MatSnackBar,
    private _fb: FormBuilder
  ) { }

  ngOnInit() {
    this.envVariable = environment;
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

  addImageUrl(value: String) {
    this.urlForImages.push(value);
    const control = <FormArray>this.mediaForm.controls['imageUrls'];
    control.patchValue(this.urlForImages);
    control.push(
      this._fb.control(value)
    );
  }

  deleteFromContainerArr(event, fileType) {
    for (let i = 0; i < event.target.files.length; i++) {
      let fileurl = event.target.files[i];
      fileurl = _.replace(fileurl, 'download', 'files');

      this.mediaUploader.delete(fileurl)
        .subscribe((response: any) => {
          if (fileType === 'video') {
            this.urlForVideo = _.remove(this.urlForVideo, function (n) {
              return n !== fileurl;
            });
            this.mediaForm.controls.videoUrls.patchValue(this.urlForVideo);
          } else if (fileType === 'image') {
            this.urlForImages = _.remove(this.urlForImages, function (n) {
              return n !== fileurl;
            });
            this.mediaForm.controls.imageUrls.patchValue(this.urlForImages);
          }
        });

    }
  }


  deleteFromContainer(fileUrl, fileType) {
    const fileurl = fileUrl;
    fileUrl = _.replace(fileUrl, 'download', 'files');
    this.mediaUploader.delete(fileUrl)
      .subscribe((response: any) => {
        if (fileType === 'video') {
          this.urlForVideo = _.remove(this.urlForVideo, function (n) {
            return n !== fileurl;
          });
          this.mediaForm.controls.videoUrls.patchValue(this.urlForVideo);
        } else if (fileType === 'image') {
          this.urlForImages = _.remove(this.urlForImages, function (n) {
            return n !== fileurl;
          });
          this.mediaForm.controls.imageUrls.patchValue(this.urlForImages);
        }
      });
  }

  addVideoUrl(value: String) {
    this.urlForVideo.push(value);
    const control = <FormArray>this.mediaForm.controls['videoUrls'];
    control.push(
      this._fb.control(value)
    );
  }

  submitCollection() {
    this.editService.submitCollection(this.mediaForm.value).subscribe(res => {
      if (this.mediaForm.valid) {
        this.stepper.next();
      } else {
        this.matSnackBar.open('Please add an image', 'Close', { duration: 3000 });
      }
    });
  }

}
