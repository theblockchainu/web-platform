import { Component, OnInit, Inject } from '@angular/core';
import { CollectionService } from '../../collection/collection.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-exit-collection-dialog',
  templateUrl: './exit-collection-dialog.component.html',
  styleUrls: ['./exit-collection-dialog.component.scss']
})
export class ExitCollectionDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ExitCollectionDialogComponent>
    , @Inject(MAT_DIALOG_DATA) public data: any,
    private _collectionService: CollectionService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  dropOut() {
    this._collectionService.removeParticipant(this.data.collectionId, this.data.userId).subscribe((response) => {
      if (response) {
        this.dialogRef.close(true);
      }
    }, err => {
      this.snackBar.open('Couldn&#39;t Drop out', 'Retry', {
        duration: 5000
      }).onAction().subscribe(res => {
        this.dropOut();
      });
    });
  }
}
