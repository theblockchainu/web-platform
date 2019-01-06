import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-content-project-dialog',
  templateUrl: './content-project-dialog.component.html',
  styleUrls: ['./content-project-dialog.component.scss']
})
export class ContentProjectDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InputData,
    public dialogRef: MatDialogRef<ContentProjectDialogComponent>,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
  }

  exitDialog(val) {
    this.dialogRef.close(val);
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
  peerHasSubmission: boolean;
  collectionId: string;
  collection: any;
  calendarId: string;
}
