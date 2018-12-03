import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../../_services/profile/profile.service';
import * as moment from 'moment';
import { PaymentService } from '../../_services/payment/payment.service';
import { CollectionService } from '../../_services/collection/collection.service';
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material';
import { BehaviorSubject, observable, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { flatMap, catchError } from 'rxjs/operators';

@Component({
	selector: 'app-book-session',
	templateUrl: './book-session.component.html',
	styleUrls: ['./book-session.component.scss']
})
export class BookSessionComponent implements OnInit {

	public envVariable;
	@ViewChild('cardForm', { read: ElementRef }) cardForm: ElementRef;
	public userId;
	teacherId: string;
	public collection: any = {};
	public currentCalendar: any = {};
	public collectionTitle = '';
	public message: string;
	public savingData = false;
	public guestCount = 1;
	public hourMapping:
		{ [k: string]: string } = { '=0': 'Less than an hour', '=1': 'One hour', 'other': '# hours' };
	public step: number;
	public availability: Array<any> = [];
	public session: any;
	public packages: Array<any>;
	public selectedPackageIndex: any;
	public backupSlots: Array<any>;
	public totalDuration: BehaviorSubject<number>;
	public provisions: Array<any>;
	public bookingProcess: any;
	public displayMode;
	public contentId;
	public desiredContent: any;
	public selectedFormattedTime = '';
	ccAvenue: boolean;
	totalCost: number;
	contentArray: Array<any>;
	paymentBatchId: string;
	loadingCountry: boolean;
	loadingData: boolean;

	constructor(
		private _cookieUtilsService: CookieUtilsService,
		private activatedRoute: ActivatedRoute,
		public _collectionService: CollectionService,
		public profileService: ProfileService,
		private router: Router,
		private snackBar: MatSnackBar,
		private paymentService: PaymentService
	) {
		this.envVariable = environment;
		this.activatedRoute.params.subscribe(params => {
			this.teacherId = params['peerId'];
			if (params['mode']) {
				this.displayMode = params['mode'];
			} else {
				this.displayMode = 'request';
			}
			console.log('Display mode: ' + this.displayMode);
			if (params['contentId']) {
				this.contentId = params['contentId'];
			}
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}

	ngOnInit() {
		this.loadingData = true;
		this.getUserCountry();
		this.availability = [];
		this.step = (this.displayMode === 'request') ? 1 : 2;
		this.getAvailableSessions();
		this.totalDuration = new BehaviorSubject(0);
	}



	/**
	 * getAvailableSessions
	 */
	public getAvailableSessions() {
		const filter = {
			where: {
				'type': 'session'
			},
			include: [
				'payoutrules',
				'provisions',
				'packages',
				{ 'contents': ['packages'] },
				'preferences',
				{
					relation: 'availability',
					scope:
					{
						include: {
							relation: 'contents'
						},
						where: {
							startDateTime: {
								'gt': moment()
							}
						}
					}
				},
				{ owners: 'profiles' }
			]
		};
		this.profileService.getCollections(this.teacherId, filter).subscribe((result: any) => {
			const res = result[0];
			this.session = res;
			if (res.availability && res.availability.length > 0) {
				const availability = [];
				res.availability.forEach(availabilityItem => {
					// Check if that particular Availability slot has any existing booking (content)
					if (this.displayMode === 'request' && (!availabilityItem.contents || availabilityItem.contents.length === 0)) {
						availability.push(
							{
								'id': availabilityItem.id,
								'start': moment.utc(availabilityItem.startDateTime).local(),
								'end': moment.utc(availabilityItem.startDateTime).local().add(30, 'minutes'),
								'color': 'rgb(51,189,158)',
								'className': 'fsCalendarEvent',
								'title': 'Available'
							}
						);
					} else if (this.displayMode === 'payment' && availabilityItem.contents && availabilityItem.contents.length > 0) {
						availabilityItem.contents.forEach(content => {
							if (content.id === this.contentId) {
								this.paymentBatchId = content.paymentBatch;
								availability.push(
									{
										'id': availabilityItem.id,
										'start': moment.utc(availabilityItem.startDateTime).local(),
										'end': moment.utc(availabilityItem.startDateTime).local().add(30, 'minutes'),
										'color': 'rgb(255, 107, 113)',
										'className': 'fsCalendarEvent',
										'title': 'Approved',
										'booked': true,
										'editable': false
									}
								);
							}
						});
					}
					this.availability = availability.sort((calEventa, calEventb) =>
						(moment(calEventa.start).isAfter(moment(calEventb.start)) ? 1 : -1));
				});
				this.backupSlots = _.cloneDeep(this.availability);
			}
			if (res.packages.length > 0) {
				this.packages = res.packages;
			}
			if (res.provisions.length > 0) {
				this.provisions = res.provisions;
			}
			if (res.preferences && res.preferences.length > 0) {
				this.bookingProcess = res.preferences[0].bookingProcess;
			}
			// Autofill values for direct payment mode
			if (this.displayMode === 'payment' && this.contentId) {
				console.log('Setting up payment mode');
				this.desiredContent = res.contents.find(content => content.id === this.contentId);
				if (this.desiredContent) {
					res.packages.forEach((packageItem, index) => {
						if (packageItem.id === this.desiredContent.packages[0].id) {
							this.selectedPackageIndex = '' + index;
							console.log('Payment mode selectedPackageIndex: ' + this.selectedPackageIndex);
						}
					});
					this.updateSelectedData();
				}
			}
			this.loadingData = false;
		});
	}

	public handleEventClick(eventHandle) {
		this.availability.forEach((eventObj, index) => {
			if (eventObj.id === eventHandle.calEvent.id) {
				if (eventHandle.calEvent.booked) {
					this.cancel(eventHandle, index);
					return;
				} else {
					this.book(eventHandle, index);
					return;
				}
			}
		});
		this.updateSelectedData();
	}

	private cancel(eventHandle, index) {
		if (this.selectedPackageIndex) {
			const numberOfSlots = this.packages[this.selectedPackageIndex].duration / 30;
			for (let i = index; i < Math.min(index + numberOfSlots, this.availability.length - 1); i++) {
				const temp = _.cloneDeep(this.availability[i]);
				temp.booked = false;
				temp.color = 'rgb(51,189,158)';
				temp.className = 'fsCalendarEvent';
				temp.title = 'Available';
				this.availability[i] = temp;
			}
		} else {
			const temp = eventHandle.calEvent;
			temp.booked = false;
			temp.color = 'rgb(51,189,158)';
			temp.className = 'fsCalendarEvent';
			temp.title = 'Available';
			this.availability[index] = temp;
		}
	}

	private book(eventHandle, index) {
		if (this.selectedPackageIndex && this.packages[this.selectedPackageIndex].type === 'paid') {
			const numberOfSlots = this.packages[this.selectedPackageIndex].duration / 30;
			let assignable = true;
			let notAssignableReason = 'Cannot select these slots. Try other slots';
			for (let i = index; i < (index + numberOfSlots); i++) {
				if (this.availability[i]) {
					if (i > index && !this.availability[i].start.isSame(this.availability[i - 1].end)) {
						assignable = false;
						notAssignableReason = 'This is a ' + numberOfSlots + ' hour package. Your selection does not have a continuous avaialability of ' + numberOfSlots + ' hours. Try other dates or times.';
					}
				} else {
					assignable = false;
					notAssignableReason = 'Cannot select this slot. Not enough available slots to complete package duration.';
				}
			}
			if (assignable) {
				console.log('assigining');
				for (let i = index; i < (index + numberOfSlots); i++) {
					const temp = _.cloneDeep(this.availability[i]);
					temp.booked = true;
					temp.color = 'rgb(255, 107, 113)';
					temp.className = 'fsCalendarEvent';
					temp.title = 'Selected';
					this.availability[i] = temp;
				}
			} else {
				this.snackBar.open(notAssignableReason, 'Close', {
					duration: 5000
				});
			}
		} else if (this.selectedPackageIndex && this.packages[this.selectedPackageIndex].type === 'trial') {
			const numberOfSlots = this.packages[this.selectedPackageIndex].duration / 30;
			let assignable = true;
			for (let i = index; i < (index + numberOfSlots); i++) {
				if (this.availability[i]) {
				} else {
					assignable = false;
				}
			}
			if (assignable) {
				for (let i = index; i < (index + numberOfSlots); i++) {
					console.log(i);
					const temp = _.cloneDeep(this.availability[i]);
					temp.booked = true;
					temp.color = 'rgb(255, 107, 113)';
					temp.className = 'fsCalendarEvent';
					temp.title = 'Selected';
					this.availability[i] = temp;
				}
			} else {
				this.snackBar.open('Cannot select this slot. Not enough available slots to complete package duration.', 'Close', {
					duration: 5000
				});
			}
		} else {
			this.snackBar.open('Please select a package before selecting slots', 'Ok', {
				duration: 5000
			});
		}

	}


	public bookSession() {
		console.log('Making payment');
		this.step++;
	}

	public goBack() {
		this.step--;
	}

	public joinSession(e?: Event) {
		if (e) {
			e.preventDefault();
		}
		this.savingData = true;
		if (this.displayMode === 'request') {
			const selectedSlots: Array<any> = this.availability.filter(element => element.booked);
			const sortedSlots = selectedSlots.sort((calEventa, calEventb) => calEventa.start - calEventb.start);
			const groupArray: Array<any> = [];
			sortedSlots.forEach(slot => {
				// If the last slot in the group ends at the same time as the start time of this slot, add it to same group
				if (groupArray[groupArray.length - 1] && groupArray[groupArray.length - 1][groupArray[groupArray.length - 1].length - 1].end.isSame(slot.start)) {
					groupArray[groupArray.length - 1].push(slot);
				} else {
					// Else create a new group
					groupArray.push([slot]);
				}
			});
			const approval = (this.bookingProcess === 'auto');
			this._collectionService.postAvailability(this.userId,
				this.session.id, groupArray, approval, this.packages[this.selectedPackageIndex].id)
				.subscribe(res => {
					this.message = 'Registered for peer session. Redirecting...';
					console.log('Join session response: ');
					console.log('postAvailability');
					console.log(res);
					this.savingData = false;
					this.contentArray = res.contentArray;
					this.paymentBatchId = res.paymentBatchId;
					this.bookSession();
				}, (err) => {
					console.log(err);
					this.savingData = false;
					this.message = 'An Error has occurred,if your money has been deducted please contact support.';
				});
		} else {
			const contentArray = [];
			contentArray.push(this.desiredContent);
		}
	}

	convertTime(units: number) {
		if (units < 60) {
			return units + ' minutes';
		} else {
			return Math.round((units / 60) * 100) / 100 + ' hours';
		}
	}

	public resetSelectedSlots(event: any) {
		this.availability = _.cloneDeep(this.backupSlots);
		this.updateSelectedData();
	}

	public updateSelectedData() {
		let totalCost = 0;
		let totalDuration = 0;
		let bookedSlots = [];
		if (this.selectedPackageIndex && this.availability) {
			const selectedPackage = this.packages[this.selectedPackageIndex];
			this.availability.forEach(element => {
				if (element.booked) {
					totalDuration += 30;
					bookedSlots.push(element);
				}
			});
			if (bookedSlots && bookedSlots.length > 0) {
				bookedSlots = bookedSlots.sort((a, b) => (moment(a.start).isAfter(moment(b.start)) ? 1 : -1));
				this.selectedFormattedTime = moment(bookedSlots[0].start).format('Do MMM') + ', ' + moment(bookedSlots[0].start).format('h:mm a') + ' to ' + moment(bookedSlots[bookedSlots.length - 1].end).format('h:mm a');
			}
			totalCost = Math.ceil(totalDuration / selectedPackage.duration) * selectedPackage.price;
		} else {
			console.log('Error. Availability: ' + JSON.stringify(this.availability));
		}
		this.totalCost = totalCost;
		this.totalDuration.next(totalDuration);
	}

	paymentSuccessful(event: boolean) {
		if (event) {
			this.message = 'Payment succesful. Redirecting...';
			this.router.navigate(['console', 'learning', 'sessions']);
		} else {
			this.message = 'Payment unsuccessful';
		}
	}

	private getUserCountry() {
		this.loadingCountry = true;
		this.paymentService.getUserCountry().subscribe(res => {
			const userCountry = res['country'];
			console.log('userCountry ' + userCountry);

			if (userCountry === 'IN') {
				this.ccAvenue = true;
			} else {
				this.ccAvenue = false;
			}
			console.log(userCountry);
			this.loadingCountry = false;
		}, err => {
			console.log(err);
			this.loadingCountry = false;
		});
	}
}
