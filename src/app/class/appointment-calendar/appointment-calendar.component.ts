import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../_services/appointment/appointment.service';


export class MyEvent {
	id: number;
	title: string;
	start: string;
	end: string;
	allDay = true;
}


@Component({
	selector: 'app-appointment-calendar',
	templateUrl: './appointment-calendar.component.html',
	styleUrls: ['./appointment-calendar.component.scss']
})
export class AppointmentCalendarComponent implements OnInit {
	
	events: any[];
	
	header: any;
	
	event: MyEvent;
	
	dialogVisible = false;
	
	idGen = 100;
	
	constructor(private eventService: AppointmentService) { }
	
	ngOnInit() {
		// this.eventService.getEvents().then(events => { this.events = events; });
		this.events = [];
		this.header = {
			left: 'prev,next today',
			center: 'title',
			right: 'month'
		};
	}
	
	handleDayClick(event) {
		this.event = new MyEvent();
		this.event.start = event.date.format();
		this.dialogVisible = true;
	}
	
	handleEventClick(e) {
		this.event = new MyEvent();
		this.event.title = e.calEvent.title;
		
		const start = e.calEvent.start;
		const end = e.calEvent.end;
		if (e.view.name === 'month') {
			start.stripTime();
		}
		
		if (end) {
			end.stripTime();
			this.event.end = end.format();
		}
		
		this.event.id = e.calEvent.id;
		this.event.start = start.format();
		this.event.allDay = e.calEvent.allDay;
		this.dialogVisible = true;
	}
	
	saveEvent() {
		// update
		if (this.event.id) {
			const index: number = this.findEventIndexById(this.event.id);
			if (index >= 0) {
				this.events[index] = this.event;
			}
		} else {
			this.event.id = this.idGen++;
			this.events.push(this.event);
			this.event = null;
		}
		
		this.dialogVisible = false;
	}
	
	deleteEvent() {
		const index: number = this.findEventIndexById(this.event.id);
		if (index >= 0) {
			this.events.splice(index, 1);
		}
		this.dialogVisible = false;
	}
	
	findEventIndexById(id: number) {
		let index = -1;
		for (let i = 0; i < this.events.length; i++) {
			if (id === this.events[i].id) {
				index = i;
				break;
			}
		}
		
		return index;
	}
}
