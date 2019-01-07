import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Router } from '@angular/router';

@Component({
	selector: 'app-content-video-dialog',
	templateUrl: './content-video-dialog.component.html',
	styleUrls: ['./content-video-dialog.component.scss']
})
export class ContentVideoDialogComponent implements OnInit {
	
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: InputData,
		public dialogRef: MatDialogRef<ContentVideoDialogComponent>,
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
	collectionId: string;
	collection: any;
	calendarId: string;
}
