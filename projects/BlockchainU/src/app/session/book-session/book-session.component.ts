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
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';

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
	@ViewChild('paymentframe', { read: ElementRef }) paymentFrame: ElementRef;
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
	public loadingCountry = true;
	public ccavenueMerchantId;
	public ccavenueAccessCode;
	public ccavenueEncRequest;
	public ccavenueIframe;
	public userCountry = 'USA';
	public ccavenueReady = false;
	public paymentStatus;
	public statusMessage;
	public failureMessage;
	public addressForm: FormGroup;
	public isBillingAddressAvailable = false;
	public maxLength = 140;
	private referrerId: string;
	public student;
	public emailVerified;
	public burnAddress: string;

	constructor(
		private _cookieUtilsService: CookieUtilsService,
		private activatedRoute: ActivatedRoute,
		public _collectionService: CollectionService,
		public profileService: ProfileService,
		public paymentService: PaymentService,
		private router: Router,
		private snackBar: MatSnackBar,
		private _dialogsService: DialogsService,
		private sanitizer: DomSanitizer,
		private matSnackBar: MatSnackBar,
		private _fb: FormBuilder
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

		this.activatedRoute.queryParams.subscribe(params => {
			if (params['paymentStatus']) {
				this.paymentStatus = params['paymentStatus'];
				this.statusMessage = params['statusMessage'];
				this.failureMessage = params['failureMessage'];
				console.log('Payment status: ' + this.paymentStatus);
				this.actOnPaymentStatus();
			}
		});

		this.userId = _cookieUtilsService.getValue('userId');
		this.ccavenueAccessCode = environment.ccavenueAccessCode;
		this.ccavenueMerchantId = environment.ccavenueMerchantId;
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
		this.getUserCountry();
		this.initializeInputs();
		this.getPeerDetails();
		this.getAvailableSessions();

		this.totalCost = new BehaviorSubject(0);
		this.totalDuration = new BehaviorSubject(0);
	}

	private initializeInputs() {
		this.addressForm = this._fb.group({
			billing_address: ['', Validators.required],
			billing_city: ['', Validators.required],
			billing_state: ['', Validators.required],
			billing_zip: ['', Validators.required]
		});
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

	private loadStudentData() {
		const filter = {
			include: {
				profiles: ['phone_numbers', 'billingaddress']
			}
		};
		this.profileService.getPeerData(this.userId, filter).subscribe((peer: any) => {
			if (peer) {
				this.student = peer;
				this.emailVerified = peer.emailVerified;
				this.createSourceData.email = peer.email;
				this.createChargeData.customer = peer.stripeCustId;
				this.custId = peer.stripeCustId;
				this.burnAddress = peer.ethAddress;
				console.log(this.custId);

				if (!this.emailVerified) {
					this._dialogsService.openOnboardingDialog(true).subscribe((result: any) => {
						// do nothing
					});
				}

				if (this.student.profiles[0].billingaddress && this.student.profiles[0].billingaddress.length > 0) {
					this.addressForm.controls.billing_address.patchValue(this.student.profiles[0].billingaddress[0].billing_address);
					this.addressForm.controls.billing_city.patchValue(this.student.profiles[0].billingaddress[0].billing_city);
					this.addressForm.controls.billing_state.patchValue(this.student.profiles[0].billingaddress[0].billing_state);
					this.addressForm.controls.billing_zip.patchValue(this.student.profiles[0].billingaddress[0].billing_zip);
					this.isBillingAddressAvailable = true;
				}
				if (this.paymentStatus !== undefined && this.paymentStatus !== null && !this.paymentStatus) {
					this.actOnPaymentStatus();
				}

				// get all cards
				this.paymentService.listAllCards(this.userId, this.custId).subscribe((cards: any) => {
					this.loadingCards = false;
					if (cards) {
						this.listAllCards = cards.data;
						console.log('listAllCards: ' + JSON.stringify(this.listAllCards));

						if (this.listAllCards && this.listAllCards.length > 0) {
							this.isCardExist = true;
						}
					} else {

						this.loadingCards = false;

					}
				}, err => {
					this.loadingCards = false;
				});
			}

		});
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
			this.loadStudentData();
		});
	}

	/**
	 * getPeerDetails
	 */
	public getPeerDetails() {
		return this.profileService.getPeerData(this.userId).pipe(map((peer: any) => {
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
		}));
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
		this.loadCCAvenueForm();
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
			this._collectionService.postAvailability(this.userId, this.session.id, groupArray, approval, this.packages[this.selectedPackageIndex].id).subscribe(res => {
				this.message = 'Registered for peer session. Redirecting...';
				console.log('Join session response: ');
				console.log(res);
				this.paymentService.getUserCountry().subscribe(country => {
					console.log(this.userCountry);
					this.loadingCountry = false;
					if (country['country'] === 'IN') {
						this.router.navigate(['console', 'learning', 'sessions']);
					} else {
						this.processPayment(res);
					}
				}, err => {
					console.log(err);
				});
			}, (err) => {
				console.log(err);
				this.savingData = false;
				this.message = 'An Error has occurred,if your money has been deducted please contact support.';
			});
		} else {
			const contentArray = [];
			this.paymentService.getUserCountry().subscribe(res => {
				console.log(this.userCountry);
				this.loadingCountry = false;
				if (res['country'] === 'IN') {
					this.router.navigate(['console', 'learning', 'sessions']);
				} else {
					contentArray.push(this.desiredContent);
					this.processPayment(this.desiredContent);
				}
			}, err => {
				console.log(err);
			});

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

	loadEvents(event) {
		this.getAvailableSessions();
	}

	private getUserCountry() {
		this.paymentService.getUserCountry().subscribe(res => {
			this.userCountry = res['country'];
			console.log(this.userCountry);
			this.loadingCountry = false;
		}, err => {
			console.log(err);
			this.loadingCountry = false;
		});
	}

	private loadCCAvenueForm() {
		console.log('Getting CC Aveneu form');
		this.ccavenueReady = false;
		console.log(this.userCountry);
		console.log(this.paymentStatus);

		console.log(this.isBillingAddressAvailable);

		console.log(this.userCountry === 'IN' && this.paymentStatus === undefined && this.isBillingAddressAvailable);

		// Get CC Avenue encrypted data if payment is being made in India
		if (this.userCountry === 'IN' && this.paymentStatus === undefined && this.isBillingAddressAvailable) {
			let studentPhoneNumber = '9999999999';
			if (this.student.profiles[0].phone_numbers && this.student.profiles[0].phone_numbers.length > 0) {
				studentPhoneNumber = this.student.profiles[0].phone_numbers[0].subscriber_number;
			}

			console.log('initialising body');

			const body = {
				merchant_id: this.ccavenueMerchantId,
				order_id: Date.now(),
				currency: 'INR',
				amount: '' + this.totalCost.getValue(),
				redirect_url: environment.apiUrl + '/api/transactions/ccavenueResponse',
				cancel_url: environment.apiUrl + '/api/transactions/ccavenueResponse',
				integration_type: 'iframe_normal',
				language: 'en',
				customer_identifier: this.student.email,
				billing_name: this.student.profiles[0].first_name + ' ' + this.student.profiles[0].last_name,
				billing_address: this.addressForm.value.billing_address,
				billing_city: this.addressForm.value.billing_city,
				billing_state: this.addressForm.value.billing_state,
				billing_zip: this.addressForm.value.billing_zip,
				billing_country: 'India',
				billing_tel: studentPhoneNumber,
				billing_email: this.student.email,
				merchant_param1: '/session/book/' + this.session.id
			};
			console.log(body);
			this.paymentService.getCCAvenueEncryptedRequest(body).subscribe(res => {
				this.ccavenueEncRequest = res;
				console.log('this.ccavenueEncRequest');
				console.log(this.ccavenueEncRequest);
				this.ccavenueIframe = this.sanitizer.bypassSecurityTrustHtml(this.ccavenueEncRequest);
				this.ccavenueReady = true;
			}, err => {
				console.log(err);
			});
		}
	}

	public handleMessage(e) {
		if (this.paymentFrame && e.data['newHeight'] !== undefined) {
			document.getElementById('paymentFrame').setAttribute('height', e.data['newHeight'] + 'px');
		}
	}

	private actOnPaymentStatus() {
		if (this.paymentStatus !== undefined) {
			this.savingData = true;
			this.ccavenueReady = false;
			if (this.userId === undefined || this.userId === null || this.userId.length < 5) {
				this.userId = this._cookieUtilsService.getValue('userId');
				console.log('Refreshed USER ID: ' + this.userId);
			}
			if (this.paymentStatus === 'Success') {
				console.log('Payment success. Joining collection and redirecting.');
				this.message = 'Payment successful. Redirecting...';
				this.savingData = false;
				this.joinSession();
			} else {
				console.log('Payment unsuccessful.');
				const message = this.statusMessage && this.statusMessage.length > 0 && this.statusMessage !== 'null' ? this.statusMessage : 'An error occurred.';
				this.matSnackBar.open(message, 'Retry')
					.onAction().subscribe(res => {
						this.router.navigate(['session', 'book', this.session.id]);
						this.paymentStatus = undefined;
						this.savingData = false;
					});
			}
		}
	}

	public saveBillingAddress() {
		this.savingData = true;
		this.profileService.addBillingAddress(this.userId, this.student.profiles[0].id, this.addressForm.value).subscribe(res => {
			if (res) {
				this.isBillingAddressAvailable = true;
				this.loadCCAvenueForm();
			} else {
				this.isBillingAddressAvailable = false;
			}
			this.savingData = false;
		}, err => {
			this.savingData = false;
			this.isBillingAddressAvailable = false;
			this.matSnackBar.open('Could not save billing address. Try again later.', 'OK', { duration: 5000 });
		});
	}
}
