import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-content-inperson-dialog',
  templateUrl: './content-inperson-dialog.component.html',
  styleUrls: ['./content-inperson-dialog.component.scss']
})
export class ContentInpersonDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InputData,
    public dialogRef: MatDialogRef<ContentInpersonDialogComponent>,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
  }

  openContent() {
    this.dialogRef.close();
    this.router.navigate(['/content', this.data.content.id]);
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
