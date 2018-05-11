import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CommunityService } from '../../community/community.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-scholarship-dialog',
  templateUrl: './scholarship-dialog.component.html',
  styleUrls: ['./scholarship-dialog.component.scss']
})
export class ScholarshipDialogComponent implements OnInit {

  public scholarshipForm: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _communityService: CommunityService,
    public dialogRef: MatDialogRef<ScholarshipDialogComponent>,
    private matSnackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.scholarshipForm = this._fb.group({
      karma: this.data.karma ? this.data.karma : '',
      type: this.data.type ? this.data.type : '',
      max_karma: this.data.max_karma ? this.data.max_karma : '',
      min_gyan: this.data.min_gyan ? this.data.min_gyan : ''
    });
  }

  public submitForm() {
    this.dialogRef.close(this.scholarshipForm.value);
  }


}
