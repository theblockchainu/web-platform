import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

@Component({
  selector: 'app-content-inperson-dialog',
  templateUrl: './content-inperson-dialog.component.html',
  styleUrls: ['./content-inperson-dialog.component.scss']
})
export class ContentInpersonDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InputData,
    public dialogRef: MatDialogRef<ContentInpersonDialogComponent>,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

}

interface InputData {
  content: any;
  startDate: any;
  endDate: any;
  userType: string;
  collection: any;
  calendarId: string;
}
