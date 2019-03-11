import { Component, OnInit, Input, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProfileService } from '../../_services/profile/profile.service';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PaymentService } from '../../_services/payment/payment.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material';

@Component({
	selector: 'app-ccavenue-payment',
	templateUrl: './ccavenue-payment.component.html',
	styleUrls: ['./ccavenue-payment.component.scss']
})

export class CcavenuePaymentComponent implements OnInit, OnChanges {
	public addressForm: FormGroup;
	public ccavenueReady: boolean;
	public ccavenueMerchantId;
	public ccavenueEncRequest;
	public ccavenueIframe;
	public taxRate = 0.00;
	public taxAmount: number;
	public codefound: any;
	public applyPromoCode = false;

	public statusMessage;
	public failureMessage;
	public isBillingAddressAvailable = false;
	private userId: string;
	private student: any;
	emailVerified: boolean;
	savingData: boolean;

	@Input() teacherId: string;
	@Input() totalPrice: number;
	@Input() paymentBatchId: string;

	@ViewChild('paymentframe', { read: ElementRef }) paymentFrame: ElementRef;

	constructor(
		private _profileService: ProfileService,
		private _fb: FormBuilder,
		private _cookieService: CookieService,
		private _paymentService: PaymentService,
		private sanitizer: DomSanitizer,
		private matSnackBar: MatSnackBar
	) { }

	ngOnInit() {
		this.setupForms();
		this.setupVariables();
	}

	ngOnChanges() {
		this.getData();
	}

	private getData() {
		this.loadStudentData().subscribe(res => {
			this.loadCCAvenueForm();
		});
	}

	setupVariables() {
		this.ccavenueMerchantId = environment.ccavenueMerchantId;
		this.emailVerified = false;
		this.ccavenueReady = false;
	}

	private setupForms() {
		this.addressForm = this._fb.group({
			billing_address: ['', Validators.required],
			billing_city: ['', Validators.required],
			billing_state: ['', Validators.required],
			billing_zip: ['', Validators.required]
		});
	}

	private loadStudentData() {
		const filter = {
			include: {
				profiles: ['phone_numbers', 'billingaddress']
			}
		};
		this.userId = this._cookieService.get('userId');
		return this._profileService.getPeerData(this.userId, filter).pipe(map((peer: any) => {
			if (peer) {
				this.student = peer;
				this.emailVerified = peer.emailVerified;
				if (this.student.profiles[0].billingaddress && this.student.profiles[0].billingaddress.length > 0) {
					this.addressForm.controls.billing_address.patchValue(this.student.profiles[0].billingaddress[0].billing_address);
					this.addressForm.controls.billing_city.patchValue(this.student.profiles[0].billingaddress[0].billing_city);
					this.addressForm.controls.billing_state.patchValue(this.student.profiles[0].billingaddress[0].billing_state);
					this.addressForm.controls.billing_zip.patchValue(this.student.profiles[0].billingaddress[0].billing_zip);
					this.isBillingAddressAvailable = true;
				}
				this.loadCCAvenueForm();
			}
			return true;
		}));
	}

	private loadCCAvenueForm() {
		this.ccavenueReady = false;
		// Get CC Avenue encrypted data if payment is being made in India
		if (this.isBillingAddressAvailable) {
			let studentPhoneNumber = '9999999999';
			if (this.student.profiles[0].phone_numbers && this.student.profiles[0].phone_numbers.length > 0) {
				studentPhoneNumber = this.student.profiles[0].phone_numbers[0].subscriber_number;
			}
			const totalPrice = this.totalPrice + (this.taxRate * this.totalPrice);
			const body = {
				merchant_id: this.ccavenueMerchantId,
				order_id: Date.now(),
				currency: 'INR',
				amount: '' + totalPrice,
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
				merchant_param1: '/session/book/' + this.teacherId + '/processStripePayment',
				merchant_param2: this.paymentBatchId
			};
			console.log(body);
			this._paymentService.getCCAvenueEncryptedRequest(body).subscribe(res => {
				this.ccavenueEncRequest = res;
				console.log(this.ccavenueEncRequest);
				this.ccavenueIframe = this.sanitizer.bypassSecurityTrustHtml(this.ccavenueEncRequest);
				this.ccavenueReady = true;
			});
		}
	}


	public saveBillingAddress() {
		this.savingData = true;
		this._profileService.addBillingAddress(this.userId, this.student.profiles[0].id, this.addressForm.value)
			.subscribe(res => {
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

	public handleMessage(e) {
		if (this.paymentFrame && e.data['newHeight'] !== undefined) {
			document.getElementById('paymentFrame').setAttribute('height', e.data['newHeight'] + 'px');
		}
	}

}
