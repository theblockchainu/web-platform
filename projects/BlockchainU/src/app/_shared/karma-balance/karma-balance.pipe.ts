import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileService } from '../../_services/profile/profile.service';
import { ScholarshipService } from '../../_services/scholarship/scholarship.service';
import { WalletService } from '../../_services/wallet/wallet.service';

@Pipe({
	name: 'karmaBalance'
})
export class KarmaBalancePipe implements PipeTransform {

	constructor(
		private _profileService: ProfileService,
		private _scholarshipService: ScholarshipService,
		private _walletService: WalletService
	) {

	}

	transform(userId: string, forNode: string, convertTo = 'KARMA'): any {
		console.log('userId: ' + userId);
		if (!userId || userId.length === 0) {
			// create observable
			return new Observable((observer) => {
				observer.next('0');
			});
		} else {
			switch (forNode) {
				case 'peer':
					if (convertTo === 'USD') {
						console.log('getting USD value of gyan balance: ');
						return this._profileService.getKarmaBalance(userId, 'USD');
					}
					return this._profileService.getKarmaBalance(userId);
				case 'scholarship':
					if (convertTo === 'USD') {
						return this._scholarshipService.getKarmaBalance(userId, 'USD');
					}
					return this._scholarshipService.getKarmaBalance(userId);
				default:
					return new Observable((observer) => {
						observer.next('0');
					});
			}
		}
	}

}
