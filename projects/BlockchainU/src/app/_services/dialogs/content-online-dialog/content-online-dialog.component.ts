import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Router } from '@angular/router';

@Component({
	selector: 'app-content-online-dialog',
	templateUrl: './content-online-dialog.component.html',
	styleUrls: ['./content-online-dialog.component.scss']
})
export class ContentOnlineDialogComponent implements OnInit {
	
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: InputData,
		public dialogRef: MatDialogRef<ContentOnlineDialogComponent>,
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
	collection: any;
	calendarId: string;
}
