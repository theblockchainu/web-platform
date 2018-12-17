import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-lab-credentials',
  templateUrl: './lab-credentials.component.html',
  styleUrls: ['./lab-credentials.component.scss']
})
export class LabCredentialsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<LabCredentialsComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

}
