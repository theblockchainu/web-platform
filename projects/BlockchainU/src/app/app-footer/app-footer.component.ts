import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../_services/authentication/authentication.service';
import { CurrencyPickerService } from '../_services/currencypicker/currencypicker.service';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';

@Component({
	selector: 'app-footer',
	templateUrl: './app-footer.component.html',
	styleUrls: ['./app-footer.component.scss']
})
export class AppFooterComponent implements OnInit {

	loggedIn: boolean;
	public selectedCurrency = 'USD';
	public availableCurrencies: Array<any>;

	constructor(
		public authService: AuthenticationService,
		public activatedRoute: ActivatedRoute,
		private _cookieUtilsService: CookieUtilsService,
		private _currencyPickerService: CurrencyPickerService
	) {}

	ngOnInit() {

		this.authService.isLoginSubject.subscribe(res => {
			this.loggedIn = res;
			this.selectedCurrency = this._cookieUtilsService.getValue('currency') && this._cookieUtilsService.getValue('currency').length > 0 ? this._cookieUtilsService.getValue('currency').toUpperCase() : 'USD';
		});

		/*this._currencyPickerService.getCurrencies().subscribe((res: any) => {
			this.availableCurrencies = res;
		});*/
		this.selectedCurrency = this._cookieUtilsService.getValue('currency') && this._cookieUtilsService.getValue('currency').length > 0 ? this._cookieUtilsService.getValue('currency').toUpperCase() : 'USD';
	}

	public updateCurrencyCookie() {
		this._cookieUtilsService.setValue('currency', this.selectedCurrency);
	}

}
