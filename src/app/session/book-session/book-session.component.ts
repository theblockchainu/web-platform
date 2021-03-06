import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../../_services/profile/profile.service';
import * as moment from 'moment';
import { PaymentService } from '../../_services/payment/payment.service';
import { CollectionService } from '../../_services/collection/collection.service';
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

declare var Stripe: any;

@Component({
	selector: 'app-book-session',
	templateUrl: './book-session.component.html',
	styleUrls: ['./book-session.component.scss']
})
export class BookSessionComponent implements OnInit {
	public stripe: any;
	public elements: any;
	public card: any;
	public envVariable;
	@ViewChild('cardForm', { read: ElementRef }) cardForm: ElementRef;
	public userId;
	private teacherId: string;
	public collection: any = {};
	public currentCalendar: any = {};
	public collectionTitle = '';
	public message: string;
	public savingData = false;
	public loader = 'assets/images/ajax-loader.gif';
	public custId;
	public createSourceData = { token: '', email: '' };
	public createChargeData = { amount: 0, currency: 'usd', source: '', description: '', customer: '' };
	public isCardExist = false;
	public listAllCards = [];
	public cardDetails: any;
	public defaultImageUrl = 'assets/images/collection-placeholder.jpg';
	public guestCount = 1;
	public hourMapping:
		{ [k: string]: string } = { '=0': 'Less than an hour', '=1': 'One hour', 'other': '# hours' };
	public useAnotherCard = false;
	public loadingCards = true;
	public step: number;
	public availability: Array<any> = [];
	public session: any;
	public packages: Array<any>;
	public selectedPackageIndex: any;
	public backupSlots: Array<any>;
	public totalCost: BehaviorSubject<number>;
	public totalDuration: BehaviorSubject<number>;
	public provisions: Array<any>;
	public bookingProcess: any;
	public displayMode;
	public contentId;
	public desiredContent: any;
	public selectedFormattedTime = '';

	constructor(
		private _cookieUtilsService: CookieUtilsService,
		private activatedRoute: ActivatedRoute,
		public _collectionService: CollectionService,
		public profileService: ProfileService,
		public paymentService: PaymentService,
		private router: Router,
		private snackBar: MatSnackBar
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
		this.stripe = Stripe(environment.stripePublishableKey);
		const elements = this.stripe.elements();
		this.card = elements.create('card', {
			iconStyle: 'solid',
			style: {
				base: {
					iconColor: '#8898AA',
					color: 'rgb(48, 48, 48)',
					lineHeight: '36px',
					fontWeight: 300,
					fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
					fontSize: '19px',

					'::placeholder': {
						color: '#8898AA',
					},
				},
				invalid: {
					iconColor: '#e85746',
					color: '#e85746',
				}
			},
			classes: {
				focus: 'is-focused',
				empty: 'is-empty',
			},
		});
		this.availability = [];
		this.step = (this.displayMode === 'request') ? 1 : 2;
		this.cardDetails = {};
		this.getPeerDetails();
		this.initializeInputs();
		this.getAvailableSessions();
		this.totalCost = new BehaviorSubject(0);
		this.totalDuration = new BehaviorSubject(0);
	}

	private initializeInputs() {
		const inputs = document.querySelectorAll('input.field');
		Array.prototype.forEach.call(inputs, function (input) {
			input.addEventListener('focus', function () {
				input.classList.add('is-focused');
			});
			input.addEventListener('blur', function () {
				input.classList.remove('is-focused');
			});
			input.addEventListener('keyup', function () {
				if (input.value.length === 0) {
					input.classList.add('is-empty');
				} else {
					input.classList.remove('is-empty');
				}
			});
		});
		this.card.mount('#card-element');
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
				{ relation: 'availability', scope: { include: { relation: 'contents' }, where: { startDateTime: { 'gt': moment() } } } },
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
								'end': moment.utc(availabilityItem.startDateTime).local().add(60, 'minutes'),
								'color': 'rgb(51,189,158)',
								'className': 'fsCalendarEvent',
								'title': 'Available'
							}
						);
					} else if (this.displayMode === 'payment' && availabilityItem.contents && availabilityItem.contents.length > 0) {
						availabilityItem.contents.forEach(content => {
							if (content.id === this.contentId) {
								availability.push(
									{
										'id': availabilityItem.id,
										'start': moment.utc(availabilityItem.startDateTime).local(),
										'end': moment.utc(availabilityItem.startDateTime).local().add(60, 'minutes'),
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
			if (res.preferences) {
				this.bookingProcess = res.preferences[0].bookingProcess;
			}
			// Autofill values for direct payment mode
			if (this.displayMode === 'payment' && this.contentId) {
				console.log('Setting up payment mode');
				this.desiredContent = res.contents.find(content => content.id === this.contentId);
				res.packages.forEach((packageItem, index) => {
					if (packageItem.id === this.desiredContent.packages[0].id) {
						this.selectedPackageIndex = '' + index;
						console.log('Payment mode selectedPackageIndex: ' + this.selectedPackageIndex);
					}
				});
				this.updateSelectedData();
			}
		});
	}

	/**
	 * getPeerDetails
	 */
	public getPeerDetails() {
		this.profileService.getPeer(this.userId).subscribe((peer: any) => {
			if (peer) {
				this.createSourceData.email = peer.email;
				this.createChargeData.customer = peer.stripeCustId;
				this.custId = peer.stripeCustId;
				// get all cards
				this.paymentService.listAllCards(this.userId, this.custId).subscribe((cards: any) => {
					this.loadingCards = false;
					if (cards) {
						this.listAllCards = cards.data;
						console.log('listAllCards: ' + JSON.stringify(this.listAllCards));
						if (this.listAllCards && this.listAllCards.length > 0) {
							this.isCardExist = true;
						}
					}
				});
			}

		});
	}

	public processPayment(content: any) {
		if ((this.bookingProcess === 'manual' && this.displayMode === 'request') || (this.bookingProcess === 'auto' && this.totalCost.getValue() === 0)) {
			// Skip payment. Redirect to console.
			this.router.navigate(['console', 'learning', 'sessions']);
		} else {
			console.log('processing payment');
			this.savingData = true;
			this.createChargeData.amount = (this.totalCost.getValue()) * 100;
			this.createChargeData.currency = this.packages[this.selectedPackageIndex].currency;
			this.createChargeData.description = this.session.id;

			if (this.isCardExist === true && !this.useAnotherCard) {
				console.log('card exist');
				this.paymentService.createContentCharge(this.userId, content.id, this.createChargeData).subscribe((resp: any) => {
					if (resp) {
						this.message = 'Payment successful. Redirecting...';
						this.router.navigate(['console', 'learning', 'sessions']);
					}
				}, err => {
					console.log(err);
				});
				console.log('exists');
			} else {
				const form = document.querySelector('form');
				const extraDetails = {
					name: form.querySelector('input[name=cardholder-name]')['value'],
					phone: form.querySelector('input[name=cardholder-phone]')['value'],
				};
				this.stripe.createToken(this.card, extraDetails).then((result: any) => {
					if (result.token) {
						this.createSourceData.token = result.token.id;
						this.paymentService.createSource(this.userId, this.custId, this.createSourceData).subscribe((res: any) => {
							if (res) {
								this.createChargeData.source = res.id;
								this.paymentService.createContentCharge(this.userId, content.id, this.createChargeData).subscribe(success => {
									if (success) {
										this.message = 'Payment successful. Registering for peer session...';
										this.router.navigate(['console', 'learning', 'sessions']);
									}
								}, err => {
									console.log(err);
								});

							} else {
								this.message = 'Error occurred. Please try again.';
								this.savingData = false;
							}
						}, (error => {
							console.log(error);
							this.message = 'Error: ' + error.statusText;
							this.savingData = false;
						}));
					} else {
						console.log(result.error);
						this.message = result.error;
						this.savingData = false;
					}
				}).catch((error) => {
					console.log(error);
					this.message = error;
					this.savingData = false;
				});
			}
		}
	}

	getcardDetails(event) {
		this.listAllCards.forEach(card => {
			if (card.id === event.value) {
				this.cardDetails = card;
				this.createChargeData.source = card.id;
			}
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
			const numberOfSlots = this.packages[this.selectedPackageIndex].duration / 60;
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
			const numberOfSlots = this.packages[this.selectedPackageIndex].duration / 60;
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
			const numberOfSlots = this.packages[this.selectedPackageIndex].duration / 60;
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
		this.step++;
	}

	public goBack() {
		this.step--;
	}

	public joinSession(e?: Event) {
		e.preventDefault();
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
			this._collectionService.postAvailability(this.userId, this.session.id, groupArray, approval, this.packages[this.selectedPackageIndex].id).subscribe(res => {
				this.message = 'Registered for peer session. Redirecting...';
				console.log('Join session response: ');
				console.log(res);
				this.processPayment(res);
			}, (err) => {
				console.log(err);
				this.savingData = false;
				this.message = 'An Error has occurred,if your money has been deducted please contact support.';
			});
		} else {
			const contentArray = [];
			contentArray.push(this.desiredContent);
			this.processPayment(this.desiredContent);
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
					totalDuration += 60;
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
		this.totalCost.next(totalCost);
		this.totalDuration.next(totalDuration);
	}
}
