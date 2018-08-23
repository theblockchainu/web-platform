import { Component, Input, OnInit, EventEmitter, Output, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
import { MatDialog } from '@angular/material';
import * as moment from 'moment';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
import { flatMap } from 'rxjs/operators';
@Component({
	selector: 'app-class-content',
	// We need to tell Angular's Dependency Injection which providers are in our app.
	providers: [],
	// Every Angular template is first compiled by the browser before Angular runs it's compiler
	templateUrl: './class-content.component.html',
	styleUrls: ['./class-content.component.scss']

})

export class ClassContentComponent implements OnInit, AfterViewInit {
	@Input()
	public myForm: FormGroup;

	@Input()
	public collection: any;

	@Input()
	public status: string;

	@Input()
	public calendar: any;

	@Output()
	days = new EventEmitter<any>();

	public envVariable;
	constructor(
		public authenticationService: AuthenticationService,
		private http: HttpClient,
		private _fb: FormBuilder,
		private requestHeaderService: RequestHeaderService,
		private dialog: MatDialog,
		public router: Router,
		public cd: ChangeDetectorRef,
		public _collectionService: CollectionService,
		private location: Location,
		private _dialogsService: DialogsService
	) {
		this.envVariable = environment;
	}

	ngOnInit() {
		this.myForm.addControl('itenary', this._fb.array([this.initItenary()]));
	}

	ngAfterViewInit() {
		this.cd.detectChanges();
	}

	initItenary() {
		return this._fb.group({
			date: [null],
			startDay: [null],
			contents: this._fb.array([])
		});
	}

	addItenary() {
		this.checkClassActive();
	}

	removeItenary(i: number) {
		const itenaries = <FormArray>this.myForm.controls.itenary;
		const itenaryGroup = <FormGroup>itenaries.controls[i];
		const contents = <Array<any>>itenaryGroup.value.contents;

		let deleteIndex = 0;

		while (deleteIndex !== contents.length) {
			this.http.delete(environment.apiUrl + '/api/contents/' + contents[deleteIndex].id, this.requestHeaderService.options)
				.subscribe((response: any) => {
					console.log(response);
				});
			deleteIndex++;
		}
		itenaries.removeAt(i);
		this.days.emit(itenaries);
	}

	save(myForm: FormGroup) {
		console.log(myForm.value);
	}
	/**
	 * numberOfdays
	 */
	public numberOfdays(currentDate, startDate) {
		const current = moment(currentDate);
		const start = moment(startDate);
		return current.diff(start, 'days');
	}

	checkClassActive() {
		if (this.collection.status === 'active') {
			this.showDialogForActiveClass(false);
		} else {
			const itenaries = <FormArray>this.myForm.controls['itenary'];
			itenaries.push(this.initItenary());
			this.days.emit(itenaries);
		}
	}

	reload(collectionId, step) {
		window.location.href = '/class/' + collectionId + '/edit/' + step;
	}

	private executeSubmitClass(collection) {
		const calendars = collection.calendars;
		const timeline = collection.contents;
		delete collection.calendars;
		delete collection.contents;
		const body = collection;
		this._collectionService.patchCollection(collection.id, body).subscribe(
			(response: any) => {
				const result = response;
				let collectionId;
				if (result.isNewInstance) {
					collectionId = result.id;
					this.reload(collectionId, 16);
				} else {
					window.location.reload();
				}
			});
	}

	showDialogForActiveClass(isContent) {
		this._dialogsService.openCollectionCloneDialog({
			type: 'class'
		}).subscribe((result) => {
			if (result === 'accept') {
				if (!isContent) {
					this.executeSubmitClass(this.collection);
				}
			} else if (result === 'reject') {
				// Do nothing
				this.router.navigate(['console', 'teaching', 'classes']);
			}
		});
	}

	saveTriggered(event, i) {
		console.log('save triggered');
		if (event.action === 'add') {
			// Show cloning warning since collection is active
			if (this.collection.status === 'active') {
				this._dialogsService.openCollectionCloneDialog({
					type: 'class'
				}).subscribe((result) => {
					if (result === 'accept') {
						this.postContent(event, i);
					} else if (result === 'reject') {
						// Do nothing
						this.router.navigate(['console', 'teaching', 'classes']);
					}
				});
			} else {
				this.postContent(event, i);
			}

		} else if (event.action === 'update') {
			if (this.collection.status === 'active') {
				this._dialogsService.openCollectionCloneDialog({
					type: 'class'
				}).subscribe((result) => {
					if (result === 'accept') {
						this.patchContent(event, i);
					} else if (result === 'reject') {
						// Do nothing
						this.router.navigate(['console', 'teaching', 'classes']);
					}
				});
			} else {
				this.patchContent(event, i);
			}
		} else if (event.action === 'delete') {
			if (this.collection.status === 'active') {
				this._dialogsService.openCollectionCloneDialog({ type: 'class' }).subscribe((result) => {
					if (result === 'accept') {
						this.deleteContent(event.value, i);
					} else if (result === 'reject') {
						// Do nothing
						this.router.navigate(['console', 'teaching', 'classes']);
					}
				});
			} else {
				this.deleteContent(event.value, i);
			}
		} else if (event.action === 'deleteDay') {
			if (this.collection.status === 'active') {
				this._dialogsService.openCollectionCloneDialog({ type: 'class' })
					.subscribe((result) => {
						if (result === 'accept') {
							this.deleteContent(null, i);
							const itenary = <FormArray>this.myForm.controls.itenary;
							itenary.removeAt(i);
							this.days.emit(itenary);
						} else if (result === 'reject') {
							// Do nothing
							this.router.navigate(['console', 'teaching', 'classes']);
						}
					});
			} else {
				this.deleteContent(null, i);
				const itenary = <FormArray>this.myForm.controls.itenary;
				itenary.removeAt(i);
				this.days.emit(itenary);
			}
		} else {
			console.log('unhandledEvent Triggered');
		}
	}

	postContent(event, i) {
		let collectionId;
		const itenaryObj = this.myForm.value.itenary[i];
		const scheduleDate = itenaryObj.date;
		const contentObj = _.cloneDeep(itenaryObj.contents[event.value]);
		const schedule = contentObj.schedule;
		delete schedule.id;
		delete contentObj.id;
		delete contentObj.schedule;
		delete contentObj.pending;

		let contentId;
		const itenary = <FormArray>this.myForm.controls.itenary;
		const form = <FormGroup>itenary.controls[i];
		const contentsArray = <FormArray>form.controls.contents;
		const contentGroup = <FormGroup>contentsArray.controls[event.value];

		if (contentObj.type === 'project' || contentObj.type === 'video') {
			if (contentObj.type === 'video') {
				schedule.endDay = 0;
			} else {
				const endDate = new Date(schedule.endDay);
				schedule.endDay = this.numberOfdays(endDate, scheduleDate);
			}
			schedule.startTime = new Date(0, 0, 0, 1, 0, 0, 0);
			schedule.endTime = new Date(0, 0, 0, 1, 0, 0, 0);
		} else if (contentObj.type === 'online' || contentObj.type === 'in-person') {
			console.log(schedule.startTime);
			console.log(schedule.endTime);
			/*const startTimeArr = schedule.startTime.toString().split(':');
			const startHour = startTimeArr[0];
			const startMin = startTimeArr[1];
			schedule.startTime = new Date(0, 0, 0, startHour, startMin, 0, 0);*/
			schedule.startTime = moment('01-02-1990 ' + schedule.startTime + ':00').format();

			/*const endTimeArr = schedule.endTime.toString().split(':');
			const endHour = endTimeArr[0];
			const endMin = endTimeArr[1];
			schedule.endTime = new Date(0, 0, 0, endHour, endMin, 0, 0);*/
			schedule.endTime = moment('01-02-1990 ' + schedule.endTime + ':00').format();
			schedule.endDay = 0;
		}
		schedule.startDay = this.numberOfdays(scheduleDate, this.calendar.startDate);

		this.http.post(environment.apiUrl + '/api/collections/' + this.collection.id + '/contents', contentObj, this.requestHeaderService.options)
			.pipe(
				flatMap((response: any) => {

					const result = response;

					if (result.isNewInstance) {
						collectionId = result.id;
						result.contents.forEach((content) => {
							if (content.isNewInstance) {
								contentId = content.id;
							}
						});
					} else {
						contentId = result.id;
					}
					contentGroup.controls.id.setValue(contentId);

					return this.http.patch(environment.apiUrl + '/api/contents/' + contentId + '/schedule', schedule, this.requestHeaderService.options);
				})
			)
			.subscribe(
				(resp: any) => {
					if (resp.status === 200) {
						const Itenary = <FormArray>this.myForm.controls.itenary;
						const Form = <FormGroup>Itenary.controls[i];
						const ContentsArray = <FormArray>Form.controls.contents;
						const ContentGroup = <FormGroup>ContentsArray.controls[event.value];
						ContentGroup.controls.pending.setValue(false);
						Form.controls['startDay'].patchValue(resp.startDay);
					}
					if (collectionId) {
						this.reload(collectionId, 16);
					}
				}
			);
	}

	patchContent(event, i) {
		let collectionId;
		const itenary = <FormArray>this.myForm.controls.itenary;
		const form = <FormGroup>itenary.controls[i];
		const contentsArray = <FormArray>form.controls.contents;
		const contentGroup = <FormGroup>contentsArray.controls[event.value];
		const ContentSchedule = <FormGroup>contentGroup.controls.schedule;
		contentGroup.controls.pending.setValue(true);

		const itenaryObj = this.myForm.value.itenary[i];
		const scheduleDate = itenaryObj.date;
		const contentObj = _.cloneDeep(itenaryObj.contents[event.value]);
		const schedule = contentObj.schedule;
		delete schedule.id;
		let contentId = contentObj.id;
		delete contentObj.id;
		delete contentObj.schedule;
		delete contentObj.pending;
		if (contentObj.type === 'project') {
			const endDay = new Date(schedule.endDay);
			schedule.endDay = endDay;
		}
		if (contentObj.type === 'online' || contentObj.type === 'in-person' || contentObj.type === 'video') {
			schedule.endDay = 0;
		}
		schedule.startDay = this.numberOfdays(scheduleDate, this.calendar.startDate);
		console.log(schedule.startTime);
		console.log(schedule.endTime);
		if (schedule.startTime === '') {
			schedule.startTime = new Date(0, 0, 0, 1, 0, 0, 0);
		} else {
			/*const startTimeArr = schedule.startTime.toString().split(':');
			const startHour = startTimeArr[0];
			const startMin = startTimeArr[1];
			schedule.startTime = new Date(0, 0, 0, startHour, startMin, 0, 0);*/
			schedule.startTime = moment('01-02-1990 ' + schedule.startTime + ':00').format();
		}
		if (schedule.endTime === '') {
			schedule.endTime = new Date(0, 0, 0, 23, 0, 0, 0);
		} else {
			/*const endTimeArr = schedule.endTime.toString().split(':');
			const endHour = endTimeArr[0];
			const endMin = endTimeArr[1];
			schedule.endTime = new Date(0, 0, 0, endHour, endMin, 0, 0);*/
			schedule.endTime = moment('01-02-1990 ' + schedule.endTime + ':00').format();
		}
		this.http.put(environment.apiUrl + '/api/collections/' + this.collection.id + '/contents/' + contentId, contentObj, this.requestHeaderService.options)
			.pipe(
				flatMap((response: any) => {
					const result = response;
					if (result.isNewInstance) {
						collectionId = result.id;
						result.contents.forEach((content) => {
							if (content.isNewInstance) {
								contentId = content.id;
							}
						});
					}
					return this.http.patch(environment.apiUrl + '/api/contents/' + contentId + '/schedule', schedule, this.requestHeaderService.options);

					if (collectionId) {
						this.reload(collectionId, 16);
					}
				})
			)
			.subscribe(
				(resp: any) => {
					if (resp.status === 200) {
						contentGroup.controls.pending.setValue(false);
					}
				}
			);
	}

	deleteContent(eventIndex, index) {
		console.log('deleting collection evI:' + eventIndex + ' itI' + index);

		const itenaryObj = this.myForm.value.itenary[index];
		const scheduleDate = itenaryObj.date;
		let collectionId;
		if (eventIndex !== undefined) {
			const contentObj = itenaryObj.contents[eventIndex];
			const contentId = contentObj.id;
			this.http.delete(environment.apiUrl + '/api/collections/' + this.collection.id + '/contents/' + contentId, this.requestHeaderService.options)
				.subscribe((response: any) => {
					if (response !== null) {
						const result = response;
						if (result.isNewInstance) {
							collectionId = result.id;
							this.reload(collectionId, 16);
						} else {
							const itenary = <FormArray>this.myForm.controls.itenary;
							const form = <FormGroup>itenary.controls[index];
							const contentsArray = <FormArray>form.controls.contents;
							contentsArray.removeAt(eventIndex);
							console.log('removed ' + eventIndex);

						}
					} else {
						const itenary = <FormArray>this.myForm.controls.itenary;
						const form = <FormGroup>itenary.controls[index];
						const contentsArray = <FormArray>form.controls.contents;
						contentsArray.removeAt(eventIndex);
					}
				});
		} else {
			console.log('else delete');

			const contentArray = itenaryObj.contents;
			contentArray.forEach(content => {
				this.http.delete(environment.apiUrl + '/api/collections/' + this.collection.id + '/contents/' + content.id, this.requestHeaderService.options)
					.subscribe((response: any) => {
						if (response !== null) {
							const result = response;
							if (result && result.isNewInstance) {
								collectionId = result.id;
								this.reload(collectionId, 16);
							} else {
								const itenary = <FormArray>this.myForm.controls.itenary;
							}
						} else {
							const itenary = <FormArray>this.myForm.controls.itenary;
						}
					});
			});
		}
	}

	getCalendarStartDate() {
		return new Date(this.calendar.startDate);
	}

	getCalendarEndDate() {
		return new Date(this.calendar.endDate);
	}

	getSelectedItineraryDates() {
		const selectedDates = [];
		const itineraries = <FormArray>this.myForm.controls.itenary;
		itineraries.controls.forEach(itinerary => {
			if (itinerary.value.date !== null) {
				selectedDates.push(itinerary.value.date);
			}
		});
		return selectedDates;
	}

}