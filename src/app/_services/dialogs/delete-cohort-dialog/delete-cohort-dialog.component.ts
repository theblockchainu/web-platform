import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';

@Component({
  selector: 'app-delete-cohort-dialog',
  templateUrl: './delete-cohort-dialog.component.html',
  styleUrls: ['./delete-cohort-dialog.component.scss']
})
export class DeleteCohortDialogComponent implements OnInit {
  public deleteable: boolean;

  constructor(public dialogRef: MatDialogRef<DeleteCohortDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _collectionService: CollectionService,
    private snackBar: MatSnackBar) {

  }
  ngOnInit() {
  }

  public deleteCohort() {
    this._collectionService.deleteCalendar(this.data).subscribe(res => {
      if (res) {
        console.log(res);
        this.dialogRef.close(true);
      }
    }, err => {
      this.snackBar.open('Workshop Couldn&#39;t be deleted', 'Retry', {
        duration: 800
      }).onAction().subscribe(res => {
        this.deleteCohort();
      });
    });
  }


}
