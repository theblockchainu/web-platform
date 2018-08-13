import { Pipe, PipeTransform } from '@angular/core';
import {WalletService} from '../../_services/wallet/wallet.service';
import {Observable} from 'rxjs';

@Pipe({
	name: 'convertCrypto'
})
export class ConvertCryptoPipe implements PipeTransform {
	
	constructor(
		private _walletService: WalletService
	) {
	
	}
	
	transform(value: number, from: string, to: string): any {
		if (from === 'GYAN' && to === 'KARMA') {
			return this._walletService.getKarmaToBurn(value);
		} else {
			return new Observable(observer => {
				observer.next('0');
			});
		}
	}
	
}
