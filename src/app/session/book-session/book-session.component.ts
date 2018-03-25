import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationStart } from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../../_services/profile/profile.service';
import * as moment from 'moment';
import { PaymentService } from '../../_services/payment/payment.service';
import { CollectionService } from '../../_services/collection/collection.service';
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {environment} from '../../../environments/environment';

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
  public defaultImageUrl = 'assets/images/no-image.jpg';
  public guestCount = 1;
  public hourMapping:
    { [k: string]: string } = { '=0': 'Less than an hour', '=1': 'One hour', 'other': '# hours' };
  public useAnotherCard = false;
  public loadingCards = true;
  public step: number;
  public availability: Array<any>;
  public session: any;
  public packages: Array<any>;
  public selectedPackageIndex: any;
  public backupSlots: Array<any>;
  public totalCost: BehaviorSubject<number>;
  public totalDuration: BehaviorSubject<number>;

  constructor(
    private _cookieUtilsService: CookieUtilsService,
    private activatedRoute: ActivatedRoute,
    private _collectionService: CollectionService,
    public profileService: ProfileService,
    public paymentService: PaymentService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
      this.envVariable = environment;
    this.activatedRoute.params.subscribe(params => {
      this.teacherId = params['peerId'];
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
    this.step = 1;
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
      'where': {
        'type': 'session'
      },
      'include': [
        'payoutrules',
        'provisions',
        'packages',
        'preferences',
        { 'availability': 'contents' },
        { 'owners': 'profiles' }
      ]
    };
    this.profileService.getCollections(this.teacherId, filter).subscribe(result => {
      const res = result[0];
      this.session = res;
      console.log(res);
      if (res.availability.length > 0) {
        const availability = [];
        res.availability.forEach(element => {
          if (!element.contents || element.contents.length === 0) {
            availability.push(
              {
                'id': element.id,
                'start': moment.utc(element.startDateTime).local(),
                'end': moment.utc(element.startDateTime).local().add(30, 'minutes'),
                'color': 'rgb(24, 107, 160)'
              }
            );
          }
          this.availability = availability.sort((calEventa, calEventb) =>
            (moment(calEventa.start).isAfter(moment(calEventb.start)) ? 1 : -1));
        });
        this.backupSlots = _.cloneDeep(this.availability);
      }
      if (res.packages.length > 0) {
        this.packages = res.packages;
      }
    });
  }

  /**
   * getPeerDetails
   */
  public getPeerDetails() {
    this.profileService.getPeer(this.userId).subscribe(peer => {
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

  public processPayment(e: Event) {
    console.log('processing payment');
    this.savingData = true;
    e.preventDefault();
    this.createChargeData.amount = (this.totalCost.getValue()) * 100;
    this.createChargeData.currency = this.packages[this.selectedPackageIndex].currency;
    this.createChargeData.description = this.session.id;

    if (this.isCardExist === true && !this.useAnotherCard) {
      console.log('card exist');
      this.paymentService.createCharge(this.userId, this.session.id, this.createChargeData).subscribe((resp: any) => {
        if (resp) {
          this.message = 'Payment successful. Redirecting...';
          this.joinSession();
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
              this.paymentService.createCharge(this.userId, this.session.id, this.createChargeData).subscribe(success => {
                if (success) {
                  this.message = 'Payment successful. Redirecting...';
                  this.joinSession();
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
      const numberOfSlots = this.packages[this.selectedPackageIndex].duration / 30;
      for (let i = index; i < (index + numberOfSlots); i++) {
        const temp = _.cloneDeep(this.availability[i]);
        temp.booked = false;
        temp.color = 'rgb(24, 107, 160)';
        this.availability[i] = temp;
      }
    } else {
      const temp = eventHandle.calEvent;
      temp.booked = false;
      temp.color = 'rgb(24, 107, 160)';
      this.availability[index] = temp;
    }
  }

  private book(eventHandle, index) {
    if (this.selectedPackageIndex && this.packages[this.selectedPackageIndex].type === 'paid') {
      const numberOfSlots = this.packages[this.selectedPackageIndex].duration / 30;
      let assignable = true;
      for (let i = index; i < (index + numberOfSlots); i++) {
        if (this.availability[i]) {
        } else {
          assignable = false;
        }
      }
      if (assignable) {
        console.log('assigining');
        for (let i = index; i < (index + numberOfSlots); i++) {
          const temp = _.cloneDeep(this.availability[i]);
          temp.booked = true;
          temp.color = 'green';
          this.availability[i] = temp;
        }
      } else {
        this.snackBar.open('Unassignable', 'Close', {
          duration: 800
        });
      }
    } else if (this.selectedPackageIndex && this.packages[this.selectedPackageIndex].type === 'trial') {
      const numberOfSlots = this.packages[this.selectedPackageIndex].duration / 30;
      let assignable = true;

      if (this.totalDuration.getValue() > 0) {
        this.snackBar.open('Only 1 slot in trial', 'Ok', {
          duration: 800
        });
      } else {
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
            temp.color = 'green';
            this.availability[i] = temp;
          }
        } else {
          this.snackBar.open('Unassignable', 'Close', {
            duration: 800
          });
        }
      }


    } else {
      this.snackBar.open('Please select a package', 'Ok', {
        duration: 800
      });
    }

  }


  public bookSession() {
    this.step++;
  }

  public goBack() {
    this.step--;
  }

  public joinSession() {
    const selectedSlots: Array<any> = this.availability.filter(element => element.booked);
    const sortedSlots = selectedSlots.sort((calEventa, calEventb) => calEventa.start - calEventb.start);
    const groupArray: Array<any> = [];
    sortedSlots.forEach(slot => {
      if (groupArray[groupArray.length - 1] &&
        groupArray[groupArray.length - 1][groupArray[groupArray.length - 1].length - 1].end.isSame(slot.start)) {
        groupArray[groupArray.length - 1].push(slot);
      } else {
        groupArray.push([slot]);
      }
    });
    const approval = (this.session.preferences[0].bookingProcess === 'manual') ? false : true;
    this._collectionService.postAvailability(this.userId, this.session.id, groupArray, approval).subscribe(res => {
      this.savingData = false;
      this.router.navigate(['console', 'learning', 'sessions']);
    }, (err) => {
      console.log(err);
      this.message = 'An Error has occured,if your money has been deducted please contact support';
    });
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
    if (this.selectedPackageIndex) {
      const selectedPackage = this.packages[this.selectedPackageIndex];
      this.availability.forEach(element => {
        if (element.booked) {
          totalDuration += 30;
        }
      });

      totalCost = Math.ceil(totalDuration / selectedPackage.duration) * selectedPackage.price;
    }
    this.totalCost.next(totalCost);
    this.totalDuration.next(totalDuration);
  }
}
