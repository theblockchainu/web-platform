import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';
import { DialogsService } from '../dialog.service';
import { ProfileService } from '../../profile/profile.service';
import {CookieUtilsService} from '../../cookieUtils/cookie-utils.service';
import {environment} from '../../../../environments/environment';

@Component({
	selector: 'app-view-participants',
	templateUrl: './view-participants.component.html',
	styleUrls: ['./view-participants.component.scss']
})
export class ViewParticipantsComponent implements OnInit {
	
	public userId;
	public envVariable;
	
	constructor(public dialogRef: MatDialogRef<ViewParticipantsComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any,
				private dialog: MatDialog,
				public _collectionService: CollectionService,
				public _dialogsService: DialogsService,
				public snackBar: MatSnackBar,
				public _profileService: ProfileService,
				public _cookieUtilsService: CookieUtilsService
	) {
		this.envVariable = environment;
	}
	
	ngOnInit() {
		this.userId = this._cookieUtilsService.getValue('userId');
	}
	
	
	/**
	 * messageParticipant
	 */
	public messageParticipant(participant: any) {
		console.log(participant);
		this.dialogRef.close();
		this._dialogsService.messageParticipant(participant).subscribe(result => {
			if (result) {
				console.log(result);
			}
		});
	}
	
	/**
	 * removeParticipant
	 */
	public removeParticipant(participantId: string) {
		this._collectionService.removeParticipant(this.data.experienceId, participantId).subscribe((response) => {
			location.reload();
			console.log('deleted');
		});
	}
	
	public reportProfile(participantId) {
		this._dialogsService.reportProfile().subscribe(result => {
			if (result) {
				console.log('report' + result);
				this._profileService.reportProfile(participantId, {
					'description': result,
					'is_active': true
				}).subscribe((respone) => {
					console.log(respone);
					this.snackBar.open('Profile Reported', 'Close', {
						duration: 5000
					});
				}, (err) => {
					this.snackBar.open('Profile Reported Failed', 'Retry', {
						duration: 5000
					}).onAction().subscribe(() => {
						this.reportProfile(participantId);
					});
				});
			}
		});
	}
	
	
}
