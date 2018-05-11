import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CommunityService } from '../../community/community.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-request-community-dialog',
  templateUrl: './request-community-dialog.component.html',
  styleUrls: ['./request-community-dialog.component.scss']
})
export class RequestCommunityDialogComponent implements OnInit {

  communityForm: FormGroup;

  constructor(private _fb: FormBuilder,
    private _communityService: CommunityService,
    public dialogRef: MatDialogRef<RequestCommunityDialogComponent>,
    private matSnackBar: MatSnackBar) { }

  ngOnInit() {
    this.communityForm = this._fb.group({
      title: '',
      description: ''
    });
  }

  public submitForm() {
    this._communityService.requestCommunity(this.communityForm.value).subscribe(res => {
      this.matSnackBar.open('Successfully requested for community', 'Close', {
        duration: 800
      });
      this.dialogRef.close();
    });
  }

}
