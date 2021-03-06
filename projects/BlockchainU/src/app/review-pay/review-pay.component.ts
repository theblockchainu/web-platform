import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../_services/profile/profile.service';
import * as moment from 'moment';
import { PaymentService } from '../_services/payment/payment.service';
import { CollectionService } from '../_services/collection/collection.service';
import { environment } from '../../environments/environment';
import { ScholarshipService } from '../_services/scholarship/scholarship.service';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { DialogsService } from '../_services/dialogs/dialog.service';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '../_services/authentication/authentication.service';
declare var Stripe: any;
declare var fbq: any;

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
    @ViewChild('paymentframe', { read: ElementRef }) paymentFrame: ElementRef;
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
    public payAtVenue = false;
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
    public taxRate = 0.00;
    public taxAmount: number;
    public codefound: any;
    public applyPromoCode = false;
    public ccavenueReady = false;
    public ccavenueMerchantId;
    public ccavenueAccessCode;
    public ccavenueEncRequest;
    public ccavenueIframe;
    public paymentStatus;
    public statusMessage;
    public failureMessage;
    public addressForm: FormGroup;
    public isBillingAddressAvailable = false;
    public maxLength = 140;
    private referrerId: string;

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
        private matSnackBar: MatSnackBar,
        private _authenticationService: AuthenticationService,
        private sanitizer: DomSanitizer,
        private renderer: Renderer2
    ) {
        this.envVariable = environment;
        this.activatedRoute.params.subscribe(params => {
            this.collectionId = params['collectionId'];
            this.collectionCalendarId = params['calendarId'];
        });
        this.activatedRoute.queryParams.subscribe(params => {
            if (params['paymentStatus']) {
                this.paymentStatus = params['paymentStatus'];
                this.statusMessage = params['statusMessage'];
                this.failureMessage = params['failureMessage'];
                console.log('Payment status: ' + this.paymentStatus);
                this.actOnCCAvenuePaymentStatus();
            }
        });
        this.userId = _cookieUtilsService.getValue('userId');
        this.referrerId = _cookieUtilsService.getValue('referrerId');
        this.ccavenueAccessCode = environment.ccavenueAccessCode;
        this.ccavenueMerchantId = environment.ccavenueMerchantId;
    }

    ngOnInit() {
        this.setTags();
        this.setupForms();
        this.getUserCountry();
        if (Stripe) {
			this.stripe = Stripe(environment.stripePublishableKey);
			this.initializeStripeElements();
		}
        this.loadCollectionData();
        this.fetchScholarships();
        this.scholarshipAmount = 0;
    }

    private initializeStripeElements() {
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
    }

    private loadCollectionData() {
        this.paymentService.getCollectionDetails(this.collectionId).subscribe((collectionData: any) => {
            if (collectionData) {
                console.log(collectionData);
                this.createChargeData.amount = (collectionData.price) * 100;
                this.totalPrice = this.getTotalPrice(collectionData);
                this.createChargeData.currency = collectionData.currency;
                this.createChargeData.description = collectionData.description;
                this.collection = collectionData;
                this.loadStudentData();
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
                // FB Event Trigger
                try {
                    if (fbq && fbq !== undefined) {
                        fbq('track', 'InitiateCheckout', {
                            currency: 'USD',
                            value: 0.0,
                            content_type: 'product',
                            content_ids: [this.collectionId],
                            content_name: this.collection.title,
                            content_category: this.collection.type
                        });
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        });
    }

    private getTotalPrice(collection) {
        if (this.userCountry && this.userCountry === 'IN') {
            this.taxAmount = collection.price * this.taxRate;
            return collection.price;
        } else {
            this.taxAmount = 0;
            return collection.price;
        }
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
                    this.actOnCCAvenuePaymentStatus();
                } else {
                    this.loadCCAvenueForm();
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
                }, err => {
                    this.loadingCards = false;
                });
            }

        });
    }

    private setupForms() {
        this.addressForm = this._fb.group({
            billing_address: ['', Validators.required],
            billing_city: ['', Validators.required],
            billing_state: ['', Validators.required],
            billing_zip: ['', Validators.required]
        });
        this.discountCode = this._fb.control([]);
    }

    private sortAssessmentRules() {
        if (this.collection.assessment_models && this.collection.assessment_models.length > 0 && this.collection.assessment_models[0].assessment_rules) {
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
        	if (res) {
				this.userCountry = res['country'];
				console.log(this.userCountry);
			} else {
        		this.userCountry = 'IN';
			}
            this.loadingCountry = false;
        }, err => {
            console.log(err);
            this.loadingCountry = false;
        });
    }

    private loadCCAvenueForm() {
        this.ccavenueReady = false;
        // Get CC Avenue encrypted data if payment is being made in India
        if (this.userCountry === 'IN' && this.paymentStatus === undefined && this.isBillingAddressAvailable) {
            let studentPhoneNumber = '9999999999';
            if (this.student.profiles[0].phone_numbers && this.student.profiles[0].phone_numbers.length > 0) {
                studentPhoneNumber = this.student.profiles[0].phone_numbers[0].subscriber_number;
            }
            const body = {
                merchant_id: this.ccavenueMerchantId,
                order_id: Date.now(),
                currency: this.collection.currency,
                amount: '' + (this.totalPrice + this.taxAmount),
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
                merchant_param1: '/review-pay/collection/' + this.collection.id + '/' + this.collectionCalendarId
            };
            this.paymentService.getCCAvenueEncryptedRequest(body).subscribe(res => {
                this.ccavenueEncRequest = res;
                console.log(this.ccavenueEncRequest);
                this.ccavenueIframe = this.sanitizer.bypassSecurityTrustHtml(this.ccavenueEncRequest);
                this.ccavenueReady = true;
            });
        }
    }

    private setTags() {
        this.titleService.setTitle('Review & Pay');
        this.metaService.updateTag({
            property: 'og:title',
            content: 'Review & Pay'
        });
        this.metaService.updateTag({
            property: 'og:site_name',
            content: 'theblockchainu.com'
        });
        this.metaService.updateTag({
            property: 'og:image',
            content: 'https://theblockchainu.com/bu_logo_square.png'
        });
        this.metaService.updateTag({
            property: 'og:url',
            content: environment.clientUrl + this.router.url
        });
    }


    public processStripePayment(e: Event) {
        console.log('processing payment');
        this.savingData = true;
        this.createChargeData.amount = (this.totalPrice + this.taxAmount) * 100;
        e.preventDefault();
        if (this.payAtVenue) {

            const first_name = this.student.profiles[0].first_name;
            const last_name = this.student.profiles[0].last_name;
            const email = this.student.email;
            const subject = 'New Pay at Venue request received for ' + this.collection.title;
            let studentPhoneNumber = 'Not available';
            if (this.student.profiles[0].phone_numbers && this.student.profiles[0].phone_numbers.length > 0) {
                studentPhoneNumber = this.student.profiles[0].phone_numbers[0].country_code + this.student.profiles[0].phone_numbers[0].subscriber_number;
            }
            const message =
                `
                Pay At Venue: Request received for joining ` + this.collection.title + ` starting on
                ` + this.currentCalendar.startDate + `.
                You can respond via email at ` + this.student.email + `  or via phone on: ` + studentPhoneNumber + `.
            `;
            this._authenticationService.createGuestContacts(first_name, last_name, email, subject, message)
                .subscribe(res => {
                    this.matSnackBar.open('Your request to pay at the venue has been received. We\'ll get back to you once it has been approved.', 'Close', { duration: 5000 });
                    this.savingData = false;
                    this.router.navigate([this.collection.type, this.collection.customUrl]);
                }, err => {
                    this.matSnackBar.open('Error in sending mail', 'Close', { duration: 3000 });
                });
        } else {
            if (this.totalPrice > 0) {
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
                                    try {
                                        if (fbq && fbq !== undefined) {
                                            fbq('track', 'AddPaymentInfo', {
                                                currency: 'USD',
                                                value: 0.0,
                                                content_ids: [this.collectionId],
                                                content_category: this.collection.type
                                            });
                                        }
                                    } catch (e) {
                                        console.log(e);
                                    }
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
                                        console.log(err);
                                        this.message = 'Payment unsuccessful. Reason: ' + err.error.error.message;
                                        this.matSnackBar.open('Payment unsuccessful. Reason: ' + err.error.error.message, 'close', { duration: 5000 });
                                        this.savingData = false;
                                    });
                                } else {
                                    this.message = 'Error occurred. Please try again.';
                                    this.savingData = false;
                                }
                            }, (error => {
                                console.log(error);
                                this.matSnackBar.open('Error: ' + error.error.error.message, 'close', { duration: 5000 });
                                this.message = 'Error: ' + error.statusText;
                                this.savingData = false;
                            }));
                        } else {
                            console.log(result.error);
                            this.matSnackBar.open('Error: ' + result.error.error.message, 'close', { duration: 5000 });
                            this.message = result.error;
                            this.savingData = false;
                        }
                    }).catch((error) => {
                        console.log(error);
                        this.matSnackBar.open('Error: ' + error.error.error.message, 'close', { duration: 5000 });
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
        // FB Event Trigger
        this.savingData = true;
        try {
            if (fbq && fbq !== undefined) {
                fbq('track', 'Purchase', {
                    currency: this.collection.currency,
                    value: this.totalPrice + this.taxAmount,
                    content_type: 'product',
                    content_ids: [this.collectionId],
                    content_name: this.collection.title,
                    content_category: this.collection.type
                });
            }
        } catch (e) {
            console.log(e);
        }
        this._collectionService.addParticipant(this.collectionId, this.userId, this.collectionCalendarId, this.selectedScholarship, this.referrerId).subscribe((response: any) => {
            console.log(response);
            // If there is a promo code applied link it to the user
            if (this.codefound && this.codefound.id.length > 5) {
                this.profileService.linkPromoCode(this.userId, this.codefound.id).subscribe(
                    res => {
                        if (this.collectionCalendarId) {
                            this.router.navigate([this.collection.type, this.collection.customUrl, 'calendar', this.collectionCalendarId, 'paymentSuccess']);
                        } else {
                            this.router.navigate([this.collection.type, this.collection.customUrl, 'paymentSuccess']);
                        }
                    }, err => {
                        this.savingData = false;
                    }
                );
                // If there is a promo code applied and saved as cookie for CCAvenue payments - link it to the user
            } else if (this._cookieUtilsService.getValue('promo_code') && this._cookieUtilsService.getValue('promo_code').length > 0) {
                this.profileService.linkPromoCode(this.userId, this._cookieUtilsService.getValue('promo_code')).subscribe(
                    res => {
                        if (this.collectionCalendarId) {
                            this.router.navigate([this.collection.type, this.collection.customUrl, 'calendar', this.collectionCalendarId, 'paymentSuccess']);
                        } else {
                            this.router.navigate([this.collection.type, this.collection.customUrl, 'paymentSuccess']);
                        }
                    }, err => {
                        this.savingData = false;
                    }
                );
            } else {
                if (this.collectionCalendarId) {
                    this.router.navigate([this.collection.type, this.collection.customUrl, 'calendar', this.collectionCalendarId, 'paymentSuccess']);
                } else {
                    this.router.navigate([this.collection.type, this.collection.customUrl, 'paymentSuccess']);
                }
            }
        }, err => {
            console.log(err);
            this.savingData = false;
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
                        }
                    });
                }
            });
            this.calculateScholarship();
        });

    }

    private calculateScholarship() {
        this.scholarshipAmount = 0;
        this.selectedScholarship = 'NA';
        this.scholarshipForm.value.scholarships.forEach(scholarship => {
            if (scholarship.selected) {
                this._scholarshipService.getKarmaBalance(scholarship.id).subscribe((res: any) => {
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
                            this._cookieUtilsService.setValue('promo_code', codefound.id);
                        } else {
                            this.matSnackBar.open('Promo code expired', 'Close', { duration: 3000 });
                        }
                    } else {
                        this.matSnackBar.open('This account is not eligible for this Promo code', 'Close', { duration: 3000 });
                    }
                } else {
                    if (moment().isBetween(moment(codefound.validFrom), moment(codefound.validTo))) {
                        this.updatePrice(codefound);
                        this._cookieUtilsService.setValue('promo_code', codefound.id);
                    } else {
                        this.matSnackBar.open('Promo code expired', 'Close', { duration: 3000 });
                    }
                }
            } else {
                this.matSnackBar.open('Invalid Promo code', 'Close', { duration: 3000 });
            }
        }, err => {
            this.matSnackBar.open('Error applying Promo code', 'Close', { duration: 3000 });
        });
    }

    updatePrice(codefound) {
        this.matSnackBar.open('Promo code successfully applied!', 'Close', { duration: 3000 });
        if (codefound.discountType === 'percentage') {
            this.totalPrice = this.collection.price - (this.collection.price * codefound.discountValue / 100);
            if (this.userCountry && this.userCountry === 'IN') {
                this.taxAmount = this.totalPrice * this.taxRate;
            }
            this.loadCCAvenueForm();
        } else if (codefound.discountType === 'absolute') {
            this.paymentService.convertCurrency(codefound.discountValue, codefound.discountCurrency, this.collection.currency).subscribe(convertedAmount => {
                this.totalPrice = this.collection.price - convertedAmount.amount;
                if (this.userCountry && this.userCountry === 'IN') {
                    this.taxAmount = this.totalPrice * this.taxRate;
                }
                this.loadCCAvenueForm();
            });
        }
        this.codefound = codefound;
        this.discountCode.disable();
    }

    removeCode() {
        this.totalPrice = this.getTotalPrice(this.collection);
        this.discountCode.reset();
        this.discountCode.enable();
        delete this.codefound;
        this._cookieUtilsService.deleteValue('promo_code');
        this.loadCCAvenueForm();
    }

    togglePromo() {
        this.applyPromoCode = true;
    }

    public handleMessage(e) {
        if (this.paymentFrame && e.data['newHeight'] !== undefined) {
            document.getElementById('paymentFrame').setAttribute('height', e.data['newHeight'] + 'px');
        }
    }

    private actOnCCAvenuePaymentStatus() {
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
                this.joinCollection();
            } else {
                console.log('Payment unsuccessful');
                const message = this.statusMessage && this.statusMessage.length > 0 && this.statusMessage !== 'null' ? this.statusMessage : 'An error occurred.';
                this.matSnackBar.open(message, 'Retry')
                    .onAction().subscribe(res => {
                        this.router.navigate(['review-pay', 'collection', this.collectionId, this.collectionCalendarId]);
                        this.paymentStatus = undefined;
                        this.savingData = false;
                        this.loadCCAvenueForm();
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

    public toggleNotesLength() {
        if (this.collection.notes.length > this.maxLength) {
            this.maxLength = this.collection.notes.length;
        } else {
            this.maxLength = 140;
        }

    }
}
