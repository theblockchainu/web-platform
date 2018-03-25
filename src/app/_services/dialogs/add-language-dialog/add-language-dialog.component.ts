import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog, MatDialogConfig, MatIconModule, MAT_DIALOG_DATA } from '@angular/material';
import {
  FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators
} from '@angular/forms';
import { ContentService } from '../../../_services/content/content.service';

@Component({
  selector: 'app-add-language-dialog',
  templateUrl: './add-language-dialog.component.html',
  styleUrls: ['./add-language-dialog.component.scss']
})
export class AddLanguageDialogComponent implements OnInit {
  public newLanguage: FormGroup;

  constructor(public dialogRef: MatDialogRef<AddLanguageDialogComponent>,
              public _contentService: ContentService,
              private _fb: FormBuilder) { }

  ngOnInit() {
    this.newLanguage = this._fb.group({
      name: ['', Validators.required]
    });
  }

  addNewLanguage() {
    this._contentService.addNewLanguage(this.newLanguage.controls['name'].value)
        .map((res) => {
          this.dialogRef.close(res);
        })
        .subscribe();
  }

}
