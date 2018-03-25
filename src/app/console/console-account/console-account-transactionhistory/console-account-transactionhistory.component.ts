import { Component, OnInit } from '@angular/core';
import { ConsoleAccountComponent } from '../console-account.component';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../_services/payment/payment.service';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';

import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-console-account-transactionhistory',
  templateUrl: './console-account-transactionhistory.component.html',
  styleUrls: ['./console-account-transactionhistory.component.scss']
})
export class ConsoleAccountTransactionhistoryComponent implements OnInit {

  public userId;
  public userCurrency;
  public transactions: Array<any>;
  public totalSpend: number;
  public years: Array<number>;
  public months: Array<any>;
  public filterForm: FormGroup;
  public filterFutureForm: FormGroup;
  public payment_methods = ['Payment'];
  public retrievedTransactions: Array<any>;
  public totalTransactions: number;
  public futureTransactions: Array<any>;
  public retrievedFutureTransactions: Array<any>;
  public totalFutureTransactions: number;
  public loadingTransactions = false;

  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleAccountComponent: ConsoleAccountComponent,
    private _paymentService: PaymentService,
    private _fb: FormBuilder,
    private _collectionService: CollectionService,
    private _cookieUtilsService: CookieUtilsService) {
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleAccountComponent.setActiveTab(urlSegment[0].path);
    });
    this.userId = _cookieUtilsService.getValue('userId');
    this.userCurrency = this._cookieUtilsService.getValue('currency').length <= 3 ? this._cookieUtilsService.getValue('currency') : 'usd';
  }

  ngOnInit() {
    this.retrieveTransactions();
    this.setUpForm();
  }

  private setUpForm() {
    this.filterForm = this._fb.group({
      payout_method: '',
      content: '',
      year: '',
      fromMonth: '',
      toMonth: ''
    });

    this.filterFutureForm = this._fb.group({
      payout_method: '',
      content: '',
      year: '',
      fromMonth: '',
      toMonth: ''
    });

    this.filterForm.valueChanges.subscribe(result => {
      this.transactions = this.filterResults(result, this.retrievedTransactions);
    });

    this.filterFutureForm.valueChanges.subscribe(result => {
      console.log(result);
      this.futureTransactions = this.filterResults(result, this.retrievedFutureTransactions);
    });

    this.years = [];
    for (let index = 2000; index < 2030; index++) {
      this.years.push(index);
    }

    this.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  }

  private filterResults(filter: any, filterFrom: any): Array<any> {
    let filterTo = filterFrom;
    if (filter.payout_method.length > 0) {

    }
    if (filter.content.length > 0) {
      filterTo = filterTo.filter((transaction) => {
        if (transaction.collections && transaction.collections.length > 0) {
          return transaction.collections[0].title.toLowerCase().indexOf(filter.content.toLowerCase()) === 0;
        }
      });
    }
    if (filter.year > 0) {
      filterTo = filterTo.filter((transaction) => {
        return (filter.year === moment(transaction.created).year());
      });
    }
    if (filter.fromMonth > 0) {
      filterTo = filterTo.filter((transaction) => {
        return (filter.fromMonth <= moment(transaction.created).month());
      });
    }
    if (filter.toMonth > 0) {
      filterTo = filterTo.filter((transaction) => {
        console.log(moment(transaction.created).month());

        return (filter.toMonth >= moment(transaction.created).month());
      });
    }
    return filterTo;
  }

  private retrieveTransactions() {
    this.loadingTransactions = true;
    const query1 = { 'include': { 'collections': ['calendars'] }, 'order': 'modified desc' };
    this.totalTransactions = 0;
    this._paymentService.getTransactions(this.userId, query1).subscribe(result => {
      this.retrievedTransactions = result;
      this.transactions = result;
      this.loadingTransactions = false;
      result.forEach(element => {
        console.log(element);
        this.totalTransactions -= (element.amount / 100);
      });
    }, err => {
      console.log(err);
    });

    const query2 = { 'include': [{ 'payments': [{ 'peers': 'profiles' }, 'collections'] }]};
    this.futureTransactions = [];
    this._collectionService.getOwnedCollections(this.userId, JSON.stringify(query2), (err, response) => {
      response.forEach(collection => {
        if (collection.payments && collection.payments.length > 0) {
          this.futureTransactions = this.futureTransactions.concat(collection.payments);
        }
      });
      this.retrievedFutureTransactions = this.futureTransactions;
      this.totalFutureTransactions = 0;
      this.retrievedFutureTransactions.forEach(element => {
        this.totalFutureTransactions += (element.amount / 100);
      });
    });
  }
}
