import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { PaymentService } from '../../_services/payment/payment.service';
import { environment } from '../../../environments/environment';
import { ProfileService } from '../../_services/profile/profile.service';
import { flatMap, catchError } from 'rxjs/operators';
import { Observable, from, forkJoin } from 'rxjs';
declare var Stripe: any;

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss']
})
export class StripePaymentComponent implements OnInit, OnChanges {
  public stripe: any;
  public elements: any;
  public card: any;
  public loader = 'assets/images/ajax-loader.gif';
  public createSourceData = { token: '', email: '' };
  public createChargeData = { amount: 0, currency: 'usd', source: '', description: '', customer: '' };
  public custId;
  public isCardExist = false;
  public listAllCards = [];
  public cardDetails: any;
  public defaultImageUrl = 'assets/images/collection-placeholder.jpg';
  public useAnotherCard = false;
  public loadingCards = true;
  message: string;
  savingData: boolean;

  @Input() userId: string;
  @Input() bookingProcess: string;
  @Input() displayMode: string;
  @Input() totalCost: number;
  @Input() packages: any;
  @Input() selectedPackageIndex: number;
  @Input() session: any;
  @Input() contentArray: Array<any>;

  @Output() paymentSuccessful = new EventEmitter<boolean>();

  constructor(
    private paymentService: PaymentService,
    private profileService: ProfileService
  ) { }

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
    this.cardDetails = {};
    this.getPeerDetails();
    this.initializeInputs();
  }

  ngOnChanges() {

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
	 * getPeerDetails
	 */
  public getPeerDetails() {
    this.profileService.getPeerData(this.userId).pipe(flatMap(
      (peer: any) => {
        if (peer) {
          this.createSourceData.email = peer.email;
          this.createChargeData.customer = peer.stripeCustId;
          this.custId = peer.stripeCustId;
          // get all cards
          return this.paymentService.listAllCards(this.userId, this.custId);
        } else {
          return new Observable(obs => {
            obs.next();
          });
        }
      },
      catchError(err => {
        console.log(err);
        return new Observable(obs => {
          obs.next();
        });
      })
    )).subscribe((cards: any) => {
      this.loadingCards = false;
      if (cards) {
        this.listAllCards = cards.data;
        console.log('listAllCards: ' + JSON.stringify(this.listAllCards));
        if (this.listAllCards && this.listAllCards.length > 0) {
          this.isCardExist = true;
        }
      }
    }, err => {
      console.log(err);
      this.loadingCards = false;
    });
  }

  public processPayment() {
    console.log(this.contentArray);
    const requestArray = [];
    this.contentArray.forEach(content => {
      if ((this.bookingProcess === 'manual' && this.displayMode === 'request') || (this.bookingProcess === 'auto' && this.totalCost === 0)) {
        // Skip payment. Redirect to console.
        this.afterPayment();
      } else {
        console.log('processing payment');
        this.savingData = true;
        this.createChargeData.amount = (this.totalCost) * 100;
        this.createChargeData.currency = this.packages[this.selectedPackageIndex].currency;
        this.createChargeData.description = this.session.id;
        if (this.isCardExist === true && !this.useAnotherCard) {
          console.log('card exist');
          requestArray.push(this.paymentService.createContentCharge(this.userId, content.id, this.createChargeData));
          console.log('exists');
        } else {
          const form = document.querySelector('form');
          const extraDetails = {
            name: form.querySelector('input[name=cardholder-name]')['value'],
            phone: form.querySelector('input[name=cardholder-phone]')['value'],
          };
          requestArray.push(
            from(this.stripe.createToken(this.card, extraDetails)).pipe(
              flatMap((result: any) => {
                if (result.token) {
                  this.createSourceData.token = result.token.id;
                  return this.paymentService.createSource(this.userId, this.custId, this.createSourceData);
                } else {
                  console.log(result.error);
                  return new Observable(obs => {
                    obs.next();
                  });
                }
              }),
              flatMap((res: any) => {
                if (res) {
                  this.createChargeData.source = res.id;
                  return this.paymentService.createContentCharge(this.userId, content.id, this.createChargeData);
                } else {
                  this.message = 'Error occurred. Please try again.';
                  this.savingData = false;
                  return new Observable(obs => {
                    obs.next();
                  });
                }
              })
            )
          );
        }
      }
    });
    forkJoin(requestArray).subscribe(success => {
      if (success) {
        this.message = 'Payment successful';
        this.afterPayment();
      }
    }, err => {
      console.log(err);
    });

  }

  getcardDetails(event) {
    this.listAllCards.forEach(card => {
      if (card.id === event.value) {
        this.cardDetails = card;
        this.createChargeData.source = card.id;
      }
    });
  }

  afterPayment() {
    this.paymentSuccessful.next(true);
  }

}
