import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
	selector: 'app-select-date-dialog',
	templateUrl: './select-date-dialog.component.html',
	styleUrls: ['./select-date-dialog.component.scss']
})
export class SelectDateDialogComponent implements OnInit {

	public selectedIndex;
	public itineraries;
	public participants;
	public mode;
	public userType;
	public collectionType;
	public accountApproved = 'false';
	public filteredItineraries = [];
	public deletedCalendar = [];
	public userId;

	constructor(public dialogRef: MatDialogRef<SelectDateDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any) {
		this.itineraries = data.itineraries;
		this.mode = data.mode;
		this.collectionType = data.collectionType;
		this.participants = data.participants;
		this.userType = data.userType;
		this.accountApproved = data.accountApproved;
		this.userId = data.userId;
		const today = moment();
		// console.log(data);

		this.itineraries.forEach(itinerary => {
			let thisParticipantCount = 0;
			this.participants.forEach(participant => {
				if (participant.calendarId === itinerary.calendar.id) {
					thisParticipantCount++;
				}
			});
			itinerary['participantCount'] = thisParticipantCount;
			console.log(moment(itinerary.calendar.startDate).diff(today, 'days'));
			if ((moment(itinerary.calendar.endDate).diff(today, 'days') >= -1 && itinerary.calendar.status !== 'cancelled') || this.userType === 'teacher') {
				this.filteredItineraries.push(itinerary);
			}
		});
	}

	ngOnInit() {
		console.log(this.data);
	}

	onTabOpen(event) {
		this.selectedIndex = event.index;
	}

	onTabClose(event) {
		this.selectedIndex = -1;
	}

	deleteCohort(event, calendarId) {
		event.preventDefault();
		if (calendarId) {
			this.filteredItineraries = _.remove(this.filteredItineraries, (item) => {
				return item.calendar.id !== calendarId;
			});
			this.deletedCalendar.push(calendarId);
		}
	}

	closeSelectCohort() {
		if (this.mode === 'editDelete') {
			this.dialogRef.close(this.deletedCalendar);
		} else {
			this.dialogRef.close();
		}
	}

	selectCohort(calendarId) {
		this.dialogRef.close(calendarId);
	}

	public calculateDate(fromDate, day) {
		const current = moment(fromDate);
		current.add(day, 'days');
		return current.toDate();
	}

}
