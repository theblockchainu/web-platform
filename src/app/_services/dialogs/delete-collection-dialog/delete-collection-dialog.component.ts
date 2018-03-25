import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';

@Component({
  selector: 'app-delete-collection-dialog',
  templateUrl: './delete-collection-dialog.component.html',
  styleUrls: ['./delete-collection-dialog.component.scss']
})
export class DeleteCollectionDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DeleteCollectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _collectionService: CollectionService,
    private snackBar: MatSnackBar) { }
  public deleteable: boolean;
  ngOnInit() {
    if (!this.data.participants || this.data.participants.length === 0) {
      this.deleteable = true;
    } else {
      this.deleteable = false;
    }
  }

  public delete() {
    this._collectionService.deleteCollection(this.data.id).subscribe(res => {
      if (res) {
        console.log(res);
        this.dialogRef.close(true);
      }
    }, err => {
      this.snackBar.open('Workshop couldn&#39;t be deleted', 'Retry', {
        duration: 800
      }).onAction().subscribe(res => {
        this.delete();
      });
    });
  }


}
