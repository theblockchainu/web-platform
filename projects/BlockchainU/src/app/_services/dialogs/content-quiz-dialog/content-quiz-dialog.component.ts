import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

@Component({
  selector: 'app-content-quiz-dialog',
  templateUrl: './content-quiz-dialog.component.html',
  styleUrls: ['./content-quiz-dialog.component.scss']
})
export class ContentQuizDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InputData,
    public dialogRef: MatDialogRef<ContentQuizDialogComponent>,
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
  collectionId: string;
  collection: any;
  calendarId: string;
  participants: Array<any>;
}
