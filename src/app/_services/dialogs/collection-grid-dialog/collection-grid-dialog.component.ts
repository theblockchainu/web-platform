import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import {environment} from '../../../../environments/environment';

@Component({
	selector: 'app-collection-grid-dialog',
	templateUrl: './collection-grid-dialog.component.html',
	styleUrls: ['./collection-grid-dialog.component.scss']
})
export class CollectionGridDialogComponent implements OnInit {
	
	public envVariable;
	constructor(public dialogRef: MatDialogRef<CollectionGridDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any,
				private router: Router) {
		this.envVariable = environment;
	}
	
	ngOnInit() {
		console.log(this.data);
	}
	
	public openCollectionPage(id) {
		this.dialogRef.close(id);
	}
	
}
