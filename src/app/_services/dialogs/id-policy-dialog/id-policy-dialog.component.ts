import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
@Component({
  selector: 'app-id-policy-dialog',
  templateUrl: './id-policy-dialog.component.html',
  styleUrls: ['./id-policy-dialog.component.scss']
})
export class IdPolicyDialogComponent implements OnInit {

  public action;

  constructor(public dialogRef: MatDialogRef<IdPolicyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
