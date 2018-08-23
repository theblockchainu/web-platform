import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-select-field-dialog',
  templateUrl: './select-field-dialog.component.html',
  styleUrls: ['./select-field-dialog.component.scss']
})
export class SelectFieldDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SelectFieldDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Array<FormGroup>
  ) { }

  ngOnInit() {
    console.log(this.data);
  }

}
