import { Component, OnInit, Input } from '@angular/core';
import { MatStepper, MatSnackBar } from '@angular/material';
import { FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CollectionService } from '../../../../../_services/collection/collection.service';
import { ContentService } from '../../../../../_services/content/content.service';
import { EditService } from '../../edit-services/edit-services.service';
import { flatMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-step-select-courses',
  templateUrl: './step-select-courses.component.html',
  styleUrls: ['./step-select-courses.component.scss']
})
export class StepSelectCoursesComponent implements OnInit {

  @Input() stepper: MatStepper;
  @Input() courseArray: FormArray;
  step: number;
  busySavingData: boolean;

  constructor(
    private _fb: FormBuilder,
    private _collectionService: CollectionService,
    private _contentService: ContentService,
    private _editService: EditService,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.step = -1;
  }

  setStep(index: number) {
    this.step = index;
  }

  addCourse() {
    this.courseArray.push(
      this._editService.initCourse()
    );
    this.step = this.courseArray.length - 1;
  }

  delete(index: number) {
    if (this.courseArray.value[index] && this.courseArray.value[index].id && this.courseArray.value[index].id.length > 1) {
      this._contentService.deleteContent(this.courseArray.value[index].id).subscribe(res => {
        console.log(res);
      });
    }
    this.courseArray.removeAt(index);
  }

  save(index: number) {
    const contentGroup = <FormGroup>this.courseArray.controls[index];
    this.busySavingData = true;
    console.log(contentGroup.value.imageUrl);
    const query = {
      where: {
        customUrl: contentGroup.value.imageUrl
      }
    };
    let collectionId;
    if (contentGroup) {
      this._collectionService.getAllCollections(query).pipe(
        flatMap((res: any) => {
          if (res && res.length === 1) {
            console.log(res);
            collectionId = res.id;
            console.log(contentGroup.value);
            contentGroup.controls['title'].patchValue(res[0].title);
            if (contentGroup.value.id && contentGroup.value.id.length > 1) {
              return this._contentService.patchContent(contentGroup.value.id, contentGroup.value);
            } else {
              return this._collectionService.postContent(this._editService.learningPathId, contentGroup.value);
            }
          } else {
            return new Observable(obs => {
              obs.error('Collection not found');
            });
          }
        }),
        flatMap((contentInstance: any) => {
          contentGroup.controls['id'].patchValue(contentInstance.id);
          return this._contentService.linkContentToCollection(contentGroup.value.id, collectionId);
        }))
        .subscribe(res => {
          this.step = -1;
          this.busySavingData = false;
        }, err => {
          this.matSnackBar.open(err, 'close', { duration: 3000 });
          this.busySavingData = false;
        });
    } else {
      this.matSnackBar.open('error', 'close', { duration: 3000 });
      this.busySavingData = false;
    }
  }

  up(controlIndex: number) {
    if (this.courseArray.length > 1 && controlIndex > 0) {
      const formGroup1 = this.courseArray.controls[controlIndex];
      const formGroup2 = this.courseArray.controls[controlIndex - 1];
      this.courseArray.removeAt(controlIndex);
      this.courseArray.removeAt(controlIndex - 1);
      this.courseArray.insert(controlIndex, formGroup2);
      this.courseArray.insert(controlIndex - 1, formGroup1);
    }
  }

  down(controlIndex: number) {
    if (this.courseArray.length > 1 && controlIndex < this.courseArray.length - 1) {
      const formGroup1 = this.courseArray.controls[controlIndex];
      const formGroup2 = this.courseArray.controls[controlIndex + 1];
      this.courseArray.removeAt(controlIndex + 1);
      this.courseArray.removeAt(controlIndex);
      this.courseArray.insert(controlIndex, formGroup2);
      this.courseArray.insert(controlIndex + 1, formGroup1);
    }
  }

  saveOrder() {
    this.busySavingData = true;
    let indexedArray = <Array<any>>this.courseArray.value;
    indexedArray = indexedArray.map((content, index) => {
      content.contentIndex = index + 1;
      return content;
    });
    console.log(indexedArray);
    this._contentService.patchMatchingContents(indexedArray)
      .subscribe(res => {
        console.log(res);
        this.busySavingData = false;
        this.stepper.next();
      }, err => {
        console.log(err);
        this.busySavingData = false;
        this.matSnackBar.open('Error Please try again', 'Retry', { duration: 3000 }).onAction().subscribe(res => {
          this.saveOrder();
        });
      });
  }

}
