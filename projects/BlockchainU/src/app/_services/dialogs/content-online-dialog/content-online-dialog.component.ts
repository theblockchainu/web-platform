import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

@Component({
  selector: 'app-content-online-dialog',
  templateUrl: './content-online-dialog.component.html',
  styleUrls: ['./content-online-dialog.component.scss']
})
export class ContentOnlineDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InputData,
    public dialogRef: MatDialogRef<ContentOnlineDialogComponent>,
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
