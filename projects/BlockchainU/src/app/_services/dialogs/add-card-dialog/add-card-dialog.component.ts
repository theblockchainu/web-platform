import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../payment/payment.service';
import { MatDialogRef } from '@angular/material';
import { environment } from '../../../../environments/environment';
declare var Stripe: any;

@Component({
	selector: 'app-add-card-dialog',
	templateUrl: './add-card-dialog.component.html',
	styleUrls: ['./add-card-dialog.component.css']
})
export class AddCardDialogComponent implements OnInit {
	public stripe: any;
	public elements: any;
	public card: any;
	@ViewChild('cardForm', { read: ElementRef }) cardForm: ElementRef;
	
	constructor(
		public activatedRoute: ActivatedRoute,
		public paymentService: PaymentService,
		public dialogRef: MatDialogRef<AddCardDialogComponent>
	) {
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
		this.card.mount('#card-element');
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
	}
	
	public processPayment(e: Event) {
		console.log('processing payment');
		e.preventDefault();
		const form = document.querySelector('form');
		const extraDetails = {
			name: form.querySelector('input[name=cardholder-name]')['value'],
		};
		this.stripe.createToken(this.card, extraDetails).then((result: any) => {
			this.dialogRef.close(result);
		}).catch((error) => {
			console.log(error);
		});
	}
	
	
}
