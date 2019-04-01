import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';
import { ProfileService } from '../../profile/profile.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import { environment } from '../../../../environments/environment';
import { MessageParticipantDialogComponent } from '../message-participant-dialog/message-participant-dialog.component';
import { ReportProfileComponent } from '../report-profile/report-profile.component';
import {ExcelService} from '../../excel/excel.service';
import {Router} from '@angular/router';
import * as moment from 'moment';
import {AddParticipantDialogComponent} from '../add-participant-dialog/add-participant-dialog.component';

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
				private router: Router,
				public _collectionService: CollectionService,
				public snackBar: MatSnackBar,
				public _profileService: ProfileService,
				public _cookieUtilsService: CookieUtilsService,
				public _excelService: ExcelService
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
		}).afterClosed().subscribe((result: any) => {
			if (result) {
				console.log(result);
			}
		});
	}

	/**
	 * removeParticipant
	 */
	public removeParticipant(participantId: string) {
		this._collectionService.removeParticipant(this.data.collectionId, participantId).subscribe((response: any) => {
			location.reload();
			console.log('deleted');
		});
	}

	public reportProfile(participantId) {
		this.dialog.open(ReportProfileComponent, {
			panelClass: 'responsive-dialog', width: '40vw',
			height: '70vh'
		}).afterClosed().subscribe((result: any) => {
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

	public exportAsExcel(): void {
		const downloadData = [];
		this.data.participants.forEach((participant, i) => {
			let cohortDate = '';
			let promoCodeApplied = '';
			let paidAmount = '';
			if (participant.calendarId && this.data.calendars) {
				this.data.calendars.forEach(calendar => {
					if (calendar.id === participant.calendarId) {
						cohortDate = moment(calendar.startDate).format('Do MMM, YYYY') + ' to ' + moment(calendar.endDate).format('Do MMM, YYYY');
					}
				});
			}
			if (participant.promoCodesApplied) {
				participant.promoCodesApplied.forEach(promoCode => {
					if (promoCode.collections && promoCode.collections.length > 0 && promoCode.collections[0].id === this.data.collectionId) {
						promoCodeApplied = promoCode.code;
					}
				});
			}
			if (participant.transactions) {
				participant.transactions.forEach(transaction => {
					if (transaction.collections && transaction.collections.length > 0 && transaction.collections[0].id === this.data.collectionId) {
						paidAmount = transaction;
					}
				});
			}
			downloadData.push({
				'Sr No': i + 1,
				'User ID': participant.id,
				'Cohort': cohortDate,
				'First Name': participant.profiles[0].first_name,
				'Last Name': participant.profiles[0].last_name,
				'Email': participant.email,
				'Phone Number': participant.profiles[0].phone_numbers && participant.profiles[0].phone_numbers.length > 0 ? participant.profiles[0].phone_numbers[0].subscriber_number : '',
				'Gender': participant.profiles[0].gender,
				'Enrolled On': participant.joinedDate ? moment(participant.joinedDate).format('MMMM D, YYYY h:mm a') : '',
				'Paid Amount': paidAmount,
				'Promo Code Used': promoCodeApplied,
				'URL of Participant Profile': environment.clientUrl + '/profile/' + participant.id,
				'Referred By': participant.referrerId && participant.referrerId !== 'false' ? participant.referrerId : 'Organic'
			});
		});
		this._excelService.exportAsExcelFile(downloadData, 'Participant List - ' + this.data.collectionId);
	}

	public openInbox(): void {
		this.router.navigate(['console', 'inbox', this.data.chatRoomId]);
		this.dialogRef.close();
	}

	public removeInvite(inviteId) {
		// TODO
	}

	public openAddParticipantsDialog() {
		this.dialogRef.close();
		this.dialog.open(AddParticipantDialogComponent, {
			data: { collectionId: this.data.collectionId, calendarId: this.data.calendarId },
			panelClass: 'responsive-dialog',
			width: '55vw',
			height: '80vh'
		}).afterClosed();
	}

}
