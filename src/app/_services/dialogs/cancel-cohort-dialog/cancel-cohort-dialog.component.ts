import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';
@Component({
  selector: 'app-cancel-cohort-dialog',
  templateUrl: './cancel-cohort-dialog.component.html',
  styleUrls: ['./cancel-cohort-dialog.component.scss']
})
export class CancelCohortDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CancelCohortDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _collectionService: CollectionService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  cancelCohort() {
    const cancelObj = {
      status: 'cancelled'
    };
    this._collectionService.patchCalendar(this.data, cancelObj).subscribe((res: any) => {
      if (res) {
        this.dialogRef.close(true);
      }
    }, err => {
      this.snackBar.open('Cohort Couldn&#39;t be canceled', 'Retry', {
        duration: 5000
      }).onAction().subscribe(res => {
        this.cancelCohort();
      });
    });
  }
}
