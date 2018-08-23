import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import {environment} from '../../../../environments/environment';
@Component({
	selector: 'app-invite-friends-dialog',
	templateUrl: './invite-friends-dialog.component.html',
	styleUrls: ['./invite-friends-dialog.component.scss']
})
export class InviteFriendsDialogComponent implements OnInit {
	
	public url = '';
	public loggedinUserEmail = '';
	public envVariable;
	constructor(
		public dialogRef: MatDialogRef<InviteFriendsDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private snackBar: MatSnackBar
	) {
		this.envVariable = environment;
		this.url = environment.clientUrl + '/' + data.url;
	}
	
	ngOnInit() {
	}
	
	public onCopySuccess() {
		this.snackBar.open('Copied to clipboard', 'Close', {
			duration: 5000
		});
	}
	
	public onEmailClicked() {
		window.location.href = 'mailto:' + this.loggedinUserEmail + '?Subject=Want to join this ' + this.data.object.type + '?&body=Hey, I found this really fitting ' + this.data.object.type + ' you should look at - ' + this.envVariable.clientUrl + this.url;
	}
	
}
