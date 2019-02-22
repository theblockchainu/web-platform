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

		this.filterForm.valueChanges.subscribe((result: any) => {
			this.transactions = this.filterResults(result, this.retrievedTransactions);
		});

		this.filterFutureForm.valueChanges.subscribe((result: any) => {
			console.log(result);
			this.futureTransactions = this.filterResults(result, this.retrievedFutureTransactions);
		});

		this.years = [];
		for (let index = 2017; index < 2020; index++) {
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
		const query1 = { 'include': [{ 'collections': ['calendars'] }, {'contents': ['availabilities', 'packages', {'collections': {'owners': 'profiles'}}]}], 'order': 'modified desc' };
		this.totalTransactions = 0;
		this._paymentService.getTransactions(this.userId, query1).subscribe((result: any) => {
			this.retrievedTransactions = result;
			this.transactions = result;
			this.loadingTransactions = false;
			result.forEach(element => {
				if (element.gateway === 'stripe' || element.livemode) {
					this.totalTransactions -= (element.amount / 100);
				} else {
					this.totalTransactions -= parseFloat(element.amount);
				}
			});
		}, err => {
			console.log(err);
		});

		const query2 = { 'include': [{ 'payments': [{ 'peers': 'profiles' }, 'collections'] }, {'contents' : [{ 'payments': [{ 'peers': 'profiles' }, 'contents'] }]}]};
		this.futureTransactions = [];
		this._collectionService.getOwnedCollections(this.userId, JSON.stringify(query2), (err, response) => {
			response.forEach(collection => {
				if (collection.type !== 'session' && collection.payments && collection.payments.length > 0) {
					this.futureTransactions = this.futureTransactions.concat(collection.payments);
				} else if (collection.type === 'session' && collection.contents && collection.contents.length > 0) {
					collection.contents.forEach(content => {
						if (content.payments && content.payments.length > 0) {
							this.futureTransactions = this.futureTransactions.concat(content.payments);
						}
					});
				}
			});
			this.retrievedFutureTransactions = this.futureTransactions.sort((a, b) => (moment(a.updatedAt).isAfter(moment(b.updatedAt)) ? -1 : 1));
			console.log(this.retrievedFutureTransactions);
			this.totalFutureTransactions = 0;
			this.retrievedFutureTransactions.forEach(element => {
				if (element.gateway === 'stripe' || element.livemode) {
					this.totalFutureTransactions += (element.amount / 100);
				} else {
					this.totalFutureTransactions += parseFloat(element.amount);
				}
			});
		});
	}

	public makeAbsolute(value) {
		return Math.abs(value);
	}
}
