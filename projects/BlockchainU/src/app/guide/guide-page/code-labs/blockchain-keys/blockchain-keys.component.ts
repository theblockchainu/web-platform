import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material';

@Component({
	selector: 'app-blockchain-keys',
	templateUrl: './blockchain-keys.component.html',
	styleUrls: ['./blockchain-keys.component.scss']
})
export class BlockchainKeysComponent implements OnInit {

	keysArray: Array<KeyObject>;

	constructor(
		public dialogRef: MatDialogRef<BlockchainKeysComponent>,
		@Optional() @Inject(MAT_DIALOG_DATA) public data: any,
		private snackBar: MatSnackBar
	) { }

	ngOnInit() {
		console.log(this.data);
		this.keysArray = [];
		for (const key in this.data.keys) {
			if (this.data.keys.hasOwnProperty(key)) {
				this.keysArray.push(
					{
						publicKey: key,
						privateKey: this.data.keys[key]
					}
				);
			}
		}
	}

	public onCopySuccess(field: string) {
		this.snackBar.open(field + ' copied to clipboard', 'Close', {
			duration: 5000
		});
	}

}

interface KeyObject {
	publicKey: string;
	privateKey: string;
}
