import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../_services/profile/profile.service';
import * as moment from 'moment';
import { PaymentService } from '../_services/payment/payment.service';
import { CollectionService } from '../_services/collection/collection.service';
import { environment } from '../../environments/environment';
declare var Stripe: any;

@Component({
    selector: 'app-review-pay',
    templateUrl: './review-pay.component.html',
    styleUrls: ['./review-pay.component.scss']
})
export class ReviewPayComponent implements OnInit {
    public stripe: any;
    public envVariable;
    public elements: any;
    public card: any;
    @ViewChild('cardForm', { read: ElementRef }) cardForm: ElementRef;
    public userId;
    public collectionId;
    public collectionCalendarId;
    public collection: any = {};
    public totalDuration = '0';
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
    public cardDetails = {};
    public defaultImageUrl = 'assets/images/no-image.jpg';
    public guestCount = 1;
    public hourMapping:
        { [k: string]: string } = { '=0': 'Less than an hour', '=1': 'One hour', 'other': '# hours' };
    public useAnotherCard = false;
    public loadingCards = true;

    constructor(
        private _cookieUtilsService: CookieUtilsService,
        private activatedRoute: ActivatedRoute,
        private _collectionService: CollectionService,
        public profileService: ProfileService,
        public paymentService: PaymentService,
        private router: Router
    ) {
        this.envVariable = environment;
        this.activatedRoute.params.subscribe(params => {
            this.collectionId = params['collectionId'];
            this.collectionCalendarId = params['calendarId'];
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

        this.paymentService.getCollectionDetails(this.collectionId).subscribe(collectionData => {
            if (collectionData) {
                console.log(collectionData);
                this.createChargeData.amount = (collectionData.price) * 100;
                this.createChargeData.currency = collectionData.currency;
                this.createChargeData.description = collectionData.description;
                this.collection = collectionData;
                this.setCurrentCalendar();
                this.calculateTotalHours();
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
        });
        this.profileService.getPeer(this.userId).subscribe(peer => {
            if (peer) {
                this.createSourceData.email = peer.email;
                this.createChargeData.customer = peer.stripeCustId;
                this.custId = peer.stripeCustId;
                console.log(this.custId);

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

    public processPayment(e: Event) {
        console.log('processing payment');
        this.savingData = true;
        e.preventDefault();
        if (this.isCardExist === true && !this.useAnotherCard) {
            // console.log('card exist');
            this.paymentService.createCharge(this.userId, this.collectionId, this.createChargeData).subscribe((resp: any) => {
                if (resp) {
                    this.message = 'Payment successful. Redirecting...';
                    this.savingData = false;
                    this.joinCollection();
                }
            });
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
                            // console.log(JSON.stringify(res ));
                            this.createChargeData.source = res.id;
                            this.paymentService.createCharge(this.userId, this.collectionId, this.createChargeData).subscribe();
                            this.message = 'Payment successful. Redirecting...';
                            this.savingData = false;
                            this.joinCollection();
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

    getcardDetails(event) {
        this.listAllCards.forEach(card => {
            if (card.id === event.value) {
                this.cardDetails = card;
                this.createChargeData.source = card.id;
            }
        });
    }

    public setCurrentCalendar() {
        if (this.collectionCalendarId) {
            const calendarIndex = this.collection.calendars.findIndex(calendar => {
                return calendar.id === this.collectionCalendarId;
            });
            if (calendarIndex > -1) {
                this.currentCalendar = this.collection.calendars[calendarIndex];
            } else {
                console.log('Calendar instance not found');
            }
        } else {
            console.log('Calendar id not found');
        }
    }

    /**
     * calculateTotalHours
     */
    public calculateTotalHours() {
        let totalLength = 0;
        this.collection.contents.forEach(content => {
            if (content.type === 'online' || content.type === 'in-person') {
                const startMoment = moment(content.schedules[0].startTime);
                const endMoment = moment(content.schedules[0].endTime);
                const contentLength = moment.utc(endMoment.diff(startMoment)).format('HH');
                totalLength += parseInt(contentLength, 10);
            } else if (content.type === 'video') {

            }
        });
        this.totalDuration = totalLength.toString();
    }

    public joinCollection() {
        this._collectionService.addParticipant(this.collectionId, this.userId, this.collectionCalendarId, (err: any, response: any) => {
            if (err) {
                console.log(err);
            } else {
                this.router.navigate([this.collection.type, this.collectionId, 'calendar', this.collectionCalendarId, 'paymentSuccess']);
            }
        });
    }

}
