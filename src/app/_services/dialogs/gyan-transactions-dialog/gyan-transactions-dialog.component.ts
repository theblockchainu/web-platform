import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {ProfileService} from '../../profile/profile.service';

@Component({
	selector: 'app-gyan-transactions-dialog',
	templateUrl: './gyan-transactions-dialog.component.html',
	styleUrls: ['./gyan-transactions-dialog.component.scss']
})
export class GyanTransactionsDialogComponent implements OnInit {
	
	constructor(
		public dialogRef: MatDialogRef<GyanTransactionsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private _profileService: ProfileService
	) {
	
	}
	
	ngOnInit() {
	}
	
}
