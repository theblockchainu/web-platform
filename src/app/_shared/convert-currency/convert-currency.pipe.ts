import { Pipe, PipeTransform } from '@angular/core';
import { PaymentService } from '../../_services/payment/payment.service';
import { CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import {WalletService} from '../../_services/wallet/wallet.service';
@Pipe({
	name: 'convertCurrency'
})
export class ConvertCurrencyPipe implements PipeTransform {
	constructor(private _paymentService: PaymentService,
				private _walletService: WalletService,
				private _currencyPipe: CurrencyPipe,
				private _cookieUtilsService: CookieUtilsService) {
	}
	
	transform(amount: any, fromCurrency: string, cannotBeFree?: boolean): any {
		if (fromCurrency === 'GYAN') {
			return this._walletService.gyanToDollar(amount).map(
				res => {
					if (res && res['USD']) {
						return this._currencyPipe.transform(res['USD'], 'USD', 'symbol');
					} else {
						return this._currencyPipe.transform(0, 'USD', 'symbol');
					}
				}
			);
		} else {
			if (amount === 0 && !cannotBeFree) {
				// create observable
				return new Observable((observer) => {
					observer.next('FREE');
				});
			} else {
				return this._paymentService.convertCurrency(amount, fromCurrency).map(
					res => {
						if (res && res.currency) {
							return this._currencyPipe.transform(res.amount, res.currency.toUpperCase(), 'symbol', '1.0-0');
						} else {
							return this._currencyPipe.transform(amount, 'USD', 'symbol', '1.0-0');
						}
					}
				);
			}
		}
	}
	
}
