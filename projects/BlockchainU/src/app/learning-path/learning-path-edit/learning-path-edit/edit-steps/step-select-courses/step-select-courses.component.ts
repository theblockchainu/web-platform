import { Component, OnInit, Input } from '@angular/core';
import { MatStepper } from '@angular/material';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { CollectionService } from '../../../../../_services/collection/collection.service';
import { ContentService } from '../../../../../_services/content/content.service';
import { EditService } from '../../edit-services/edit-services.service';

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
    private _editService: EditService
  ) { }

  ngOnInit() {
    this.step = -1;
  }

  setStep(index: number) {
    this.step = index;
  }

  submitCourses() {

  }

  addCourse() {
    this.courseArray.push(
      this._fb.group({
        id: [''],
        title: ['', [Validators.required, Validators.minLength(10)]],
        type: [''],
        description: [''],
        supplementUrls: this._fb.array([]),
        imageUrl: [''],
        prerequisites: ['']
      })
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
    if (this.courseArray.value[index] && this.courseArray.value[index].id && this.courseArray.value[index].id.length > 1) {
      this._contentService.patchContent(this.courseArray.value[index].id, this.courseArray.value[index]).subscribe(
        res => {
          console.log('updated');
          this.step = -1;
        }
      );
    } else {
      this._collectionService.postContent(this._editService.learningPathId, this.courseArray.value[index]).subscribe(res => {
        console.log(res);
        this.step = -1;
      });
    }
  }

}
