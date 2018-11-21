import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CollectionService } from '../../../../_services/collection/collection.service';
import { map, retryWhen, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { DialogsService } from '../../../../_services/dialogs/dialog.service';

@Injectable()
export class EditService {

  learningPathId: string; // set this in the begining
  isLearningPathActive = false;

  constructor(
    public _collectionService: CollectionService,
    private matSnackBar: MatSnackBar,
    private _dialogsService: DialogsService,
    private _fb: FormBuilder
  ) { }

  public submitCollection(collectionData: any) {
    return this._collectionService.patchCollection(this.learningPathId, collectionData)
      .pipe(
        retryWhen(errors =>
          errors.pipe(
            // log error message
            tap(val => console.log(`Error!: ${val} `)),
            // restart in 5 seconds
            map(err => {
              return this._dialogsService.openLogin();
            })
          )
        )
      );
  }

  public initCourse(content?: any) {
    const group = this._fb.group({
      id: [''],
      title: ['', [Validators.required]],
      type: [''],
      description: [''],
      supplementUrls: this._fb.array([]),
      imageUrl: [''],
      prerequisites: [''],
      contentIndex: ['']
    });
    if (content) {
      group.patchValue(content);
    }
    return group;
  }

}
