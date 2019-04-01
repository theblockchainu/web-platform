import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';

@Component({
	selector: 'app-cancel-collection-dialog',
	templateUrl: './cancel-collection-dialog.component.html',
	styleUrls: ['./cancel-collection-dialog.component.scss']
})
export class CancelCollectionDialogComponent implements OnInit {

	constructor(public dialogRef: MatDialogRef<CancelCollectionDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any,
				private _collectionService: CollectionService,
				private _cookieUtilsService: CookieUtilsService,
				private snackBar: MatSnackBar) { }

	ngOnInit() {
	}

	public cancel() {
		const body = {
			'isCanceled': true,
			'canceledBy': this._cookieUtilsService.getValue('userId'),
			'status': 'cancelled',
		};
		this._collectionService.patchCollection(this.data.id, body).subscribe(res => {
			if (res) {
				this.dialogRef.close(res );
			}
		}, err => {
			this.snackBar.open('Class Couldn&#39;t be Cancelled', 'Retry', {
				duration: 5000
			}).onAction().subscribe(res => {
				this.cancel();
			});
		});
	}

}
