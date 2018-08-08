import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../_services/profile/profile.service';
import * as moment from 'moment';
import { PaymentService } from '../_services/payment/payment.service';
import { CollectionService } from '../_services/collection/collection.service';
import { environment } from '../../environments/environment';
import { ScholarshipService } from '../_services/scholarship/scholarship.service';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { sha512 } from 'js-sha512';
import { DialogsService } from '../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';
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
    public emailVerified;
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
    public student;
    public createSourceData = { token: '', email: '' };
    public createChargeData = { amount: 0, currency: 'usd', source: '', description: '', customer: '' };
    public isCardExist = false;
    public listAllCards = [];
    public cardDetails = {};
    public defaultImageUrl = 'assets/images/collection-placeholder.jpg';
    public guestCount = 1;
    public hourMapping:
        { [k: string]: string } = { '=0': 'Less than an hour', '=1': 'One hour', 'other': '# hours' };
    public useAnotherCard = false;
    public loadingCards = true;
    karma: number;
    availableScholarships = [];
    scholarshipForm: FormGroup;
    scholarshipAmount: number;
    public burnAddress: string;
    public selectedScholarship = 'NA';
    paybleKarma: number;
    public assessmentRules: Array<any>;
    public loadingCountry = true;
    public userCountry = 'USA';
    public discountCode: FormControl;
    public totalPrice: number;
    public codefound: any;

    constructor(
        private _cookieUtilsService: CookieUtilsService,
        private activatedRoute: ActivatedRoute,
        private _collectionService: CollectionService,
        public profileService: ProfileService,
        public paymentService: PaymentService,
        public _dialogsService: DialogsService,
        private router: Router,
        private _scholarshipService: ScholarshipService,
        private titleService: Title,
        private metaService: Meta,
        private _fb: FormBuilder,
        private matSnackBar: MatSnackBar
    ) {
        this.envVariable = environment;
        this.activatedRoute.params.subscribe(params => {
            this.collectionId = params['collectionId'];
            this.collectionCalendarId = params['calendarId'];
        });
        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {
        this.setTags();
        this.getUserCountry();
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
                this.totalPrice = collectionData.price;
                this.createChargeData.currency = collectionData.currency;
                this.createChargeData.description = collectionData.description;
                this.collection = collectionData;
                this.getkarma(collectionData.academicGyan + collectionData.nonAcademicGyan);
                this.setCurrentCalendar();
                this.calculateTotalHours();
                this.sortAssessmentRules();
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
        this.profileService.getPeer(this.userId).subscribe((peer: any) => {
            if (peer) {
                this.student = peer;
                this.emailVerified = peer.emailVerified;
                this.createSourceData.email = peer.email;
                this.createChargeData.customer = peer.stripeCustId;
                this.custId = peer.stripeCustId;
                this.burnAddress = peer.ethAddress;
                console.log(this.custId);

                if (!this.emailVerified) {
                    this._dialogsService.openOnboardingDialog().subscribe(result => {
                        // do nothing
                    });
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
                    }
                });
            }

        });
        this.fetchScholarships();
        this.discountCode = this._fb.control([]);
        this.scholarshipAmount = 0;
    }

    private sortAssessmentRules() {
        if (this.collection.assessment_models && this.collection.assessment_models.length > 0) {
            const assessmentRulesUnsorted = <Array<any>>this.collection.assessment_models[0].assessment_rules;
            this.assessmentRules = assessmentRulesUnsorted.sort((a, b) => {
                if (a.value > b.value) {
                    return 1;
                } else if (a.value === b.value) {
                    return 0;
                } else {
                    return -1;
                }
            });
        }
    }

    private getUserCountry() {
        this.loadingCountry = true;
        this.paymentService.getUserCountry().subscribe(res => {
            this.userCountry = res['countryCode'];
            console.log(this.userCountry);
            this.loadingCountry = false;
        }, err => {
            console.log(err);
            this.loadingCountry = false;
        });
    }

    private setTags() {
        this.titleService.setTitle('Review & Pay');
        this.metaService.updateTag({
            property: 'og:title',
            content: 'Review & Pay'
        });
        this.metaService.updateTag({
            property: 'og:site_name',
            content: 'peerbuds.com'
        });
        this.metaService.updateTag({
            property: 'og:image',
            content: 'https://peerbuds.com/pb_logo_square.png'
        });
        this.metaService.updateTag({
            property: 'og:url',
            content: environment.clientUrl + this.router.url
        });
    }


    public processPayment(e: Event) {
        console.log('processing payment');
        this.savingData = true;
        this.createChargeData.amount = this.totalPrice * 100;
        e.preventDefault();
        if (this.collection.price > 0) {
            if (this.isCardExist === true && !this.useAnotherCard) {
                // console.log('card exist');
                this.paymentService.createCharge(this.userId, this.collectionId, this.createChargeData).subscribe((resp: any) => {
                    if (resp) {
                        this.message = 'Payment successful. Redirecting...';
                        this.savingData = false;
                        this.joinCollection();
                    } else {
                        this.message = 'Payment unsuccessful. Please try again using another card or wait a few minutes.';
                        this.savingData = false;
                    }
                }, (err: any) => {
                    this.message = 'Payment unsuccessful. Reason: ' + err.error.message;
                    this.savingData = false;
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
                                this.paymentService.createCharge(this.userId, this.collectionId, this.createChargeData).subscribe((resp: any) => {
                                    if (resp) {
                                        this.message = 'Payment successful. Redirecting...';
                                        this.savingData = false;
                                        this.joinCollection();
                                    } else {
                                        this.message = 'Error occurred. Please try again.';
                                        this.savingData = false;
                                    }
                                }, (err: any) => {
                                    this.message = 'Payment unsuccessful. Reason: ' + err.error.message;
                                    this.savingData = false;
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
        } else {
            this.message = 'Signing up and redirecting...';
            this.joinCollection();
            this.savingData = false;
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
        this._collectionService.addParticipant(this.collectionId, this.userId, this.collectionCalendarId, this.selectedScholarship).subscribe((response: any) => {
            if (this.codefound && this.codefound.id.length > 5) {
                this.profileService.linkPromoCode(this.userId, this.codefound.id).subscribe(
                    res => {
                        this.router.navigate([this.collection.type, this.collectionId, 'calendar', this.collectionCalendarId, 'paymentSuccess']);
                    }
                );
            } else {
                this.router.navigate([this.collection.type, this.collectionId, 'calendar', this.collectionCalendarId, 'paymentSuccess']);
            }
        }, err => {
            console.log(err);
            this.matSnackBar.open('Error Joining Collection. Please contact us.', 'Close', { duration: 3000 });
        });
    }

    getkarma(gyan: number) {
        return this._collectionService.getKarmaToBurn(gyan).subscribe((res: any) => {
            console.log(res);
            this.karma = res.karma;
            this.paybleKarma = this.karma;
        });
    }

    fetchScholarships() {
        this.scholarshipForm = this._fb.group({
            scholarships: this._fb.array([])
        });
        const scholarships = <FormArray>this.scholarshipForm.controls['scholarships'];
        const filter = { 'include': [{ 'owner': 'profiles' }, 'peers_joined', 'allowed_collections'] };
        this.profileService.getScholarships(this.userId, filter).subscribe((res: any) => {
            console.log(res);
            res.forEach(scholarship => {
                if (scholarship.type === 'public' || scholarship.allowed_collections.length === 0) {
                    // this.availableScholarships.push(scholarship);
                    scholarships.push(this._fb.group({
                        id: scholarship.id,
                        title: scholarship.title,
                        karma: scholarship.karma,
                        min_gyan: scholarship.min_gyan,
                        max_karma: scholarship.max_karma,
                        ethAddress: scholarship.ethAddress,
                        selected: true
                    }));
                } else {
                    scholarship.allowed_collections.forEach(collection => {
                        if (this.collectionId === collection.id) {
                            scholarships.push(this._fb.group({
                                id: scholarship.id,
                                title: scholarship.title,
                                karma: scholarship.karma,
                                min_gyan: scholarship.min_gyan,
                                max_karma: scholarship.max_karma,
                                ethAddress: scholarship.ethAddress,
                                selected: true
                            }));
                            // this.availableScholarships.push(scholarship);
                        }
                    });
                }
            });
            this.calculateScholarship();
            // this.scholarshipForm.valueChanges.subscribe(changes => {
            //     this.calculateScholarship();
            // });
        });


    }
    private calculateScholarship() {
        this.scholarshipAmount = 0;
        this.selectedScholarship = 'NA';
        this.scholarshipForm.value.scholarships.forEach(scholarship => {
            if (scholarship.selected) {
                this._scholarshipService.getKarmaBalance(scholarship.id).subscribe(res => {
                    this.scholarshipAmount += Math.min(Math.min(this.karma, res), scholarship.max_karma);
                    this.burnAddress = scholarship.ethAddress;
                    this.selectedScholarship = scholarship.id;

                    const paybleKarma = this.karma - this.scholarshipAmount;
                    this.paybleKarma = (paybleKarma > 0) ? paybleKarma : 0;
                });
            }
        });
    }

    public getGyanForRule(gyanPercent, totalGyan) {
        return Math.floor((gyanPercent / 100) * totalGyan);
    }

    /*public initiatePayuPayment() {
		const hashSequence = 'wru4V51W|b2f35875-220c-4dd5-b39b-9955af0b875d|' + this.collection.price + '|' + this.collection.type + '-' + this.collection.id + '|' + this.student.profiles[0].first_name + '|' + this.student.email + '|||||||||||YlbRhVlw58';
		const hash = sha512(hashSequence);
		const RequestData = {
			key: 'wru4V51W',
			txnid: 'b2f35875-220c-4dd5-b39b-9955af0b875d',
			hash: hash,
			amount: this.collection.price,
			firstname: this.student.profiles[0].first_name,
			email: this.student.email,
			phone: this.student.profiles[0].phone_numbers[0].subscriber_number,
			productinfo: this.collection.type + '-' + this.collection.id,
			surl : environment.clientUrl + '/review-pay/collection/' + this.collectionId + '/' + this.collectionCalendarId + '?result=success',
			furl: environment.clientUrl + '/review-pay/collection/' + this.collectionId + '/' + this.collectionCalendarId + '?result=fail'
		};
		
		bolt.launch(RequestData, {
			responseHandler: function(Bolt) {
				console.log('Reached here. Payment success');
				console.log(Bolt);
			},
			catchHandler: function(error) {
				console.log('Payment error');
				console.log(error);
			}
		});
		
    }*/


    applyPromo() {
        const filter = {
            'where': {
                'code': this.discountCode.value
            },
            'include': ['peersAllowed']
        };
        this._collectionService.getPromoCodes(this.collectionId, filter).subscribe((res: any) => {
            if (res.length > 0) {
                const codefound = res[0];
                console.log(res);
                if (codefound.peersAllowed && codefound.peersAllowed.length > 0) {
                    const peerFound = codefound.peersAllowed.find(peer => {
                        return peer.id === this.userId;
                    });
                    if (peerFound) {
                        if (moment().isBetween(moment(codefound.validFrom), moment(codefound.validTo))) {
                            this.updatePrice(codefound);
                        } else {
                            this.matSnackBar.open('Promocode expired', 'Close', { duration: 3000 });
                        }
                    } else {
                        this.matSnackBar.open('You are not allowed to use this code!', 'Close', { duration: 3000 });
                    }
                } else {
                    if (moment().isBetween(moment(codefound.validFrom), moment(codefound.validTo))) {
                        this.updatePrice(codefound);
                    } else {
                        this.matSnackBar.open('Promocode expired', 'Close', { duration: 3000 });
                    }
                }

            } else {
                this.matSnackBar.open('Invalid Code', 'Close', { duration: 3000 });
            }
        }, err => {
            this.matSnackBar.open('Error applying code', 'Close', { duration: 3000 });
        });
    }

    updatePrice(codefound) {
        this.matSnackBar.open('Promocode successfully applied!', 'Close', { duration: 3000 });
        if (codefound.discountType === 'percentage') {
            this.totalPrice = this.collection.price - (this.collection.price * codefound.discountValue / 100);
        } else if (codefound.discountType === 'absolute') {
            this.paymentService.convertCurrency(codefound.discountValue, codefound.discountCurrency, this.collection.currency).subscribe(convertedAmount => {
                this.totalPrice = this.collection.price - convertedAmount.amount;
            });
        }
        this.codefound = codefound;
        this.discountCode.disable();
    }

    removeCode() {
        this.totalPrice = this.collection.price;
        this.discountCode.reset();
        this.discountCode.enable();
        delete this.codefound;
    }
}
