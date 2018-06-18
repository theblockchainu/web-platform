import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';
import { ProfileService } from '../../profile/profile.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import { environment } from '../../../../environments/environment';
import { MessageParticipantDialogComponent } from '../message-participant-dialog/message-participant-dialog.component';
import { ReportProfileComponent } from '../report-profile/report-profile.component';
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
		this.dialog.open(MessageParticipantDialogComponent, {
			data: participant,
			panelClass: 'responsive-dialog', width: '50vw',
			height: '60vh'
		}).afterClosed().subscribe(result => {
			if (result) {
				console.log(result);
			}
		});
	}

	/**
	 * removeParticipant
	 */
	public removeParticipant(participantId: string) {
		this._collectionService.removeParticipant(this.data.collectionId, participantId).subscribe((response) => {
			location.reload();
			console.log('deleted');
		});
	}

	public reportProfile(participantId) {
		this.dialog.open(ReportProfileComponent, {
			panelClass: 'responsive-dialog', width: '40vw',
			height: '70vh'
		}).afterClosed().subscribe(result => {
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
