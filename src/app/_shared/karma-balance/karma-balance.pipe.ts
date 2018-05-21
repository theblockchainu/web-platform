import { Pipe, PipeTransform } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ProfileService} from '../../_services/profile/profile.service';
import {ScholarshipService} from '../../_services/scholarship/scholarship.service';

@Pipe({
  name: 'karmaBalance'
})
export class KarmaBalancePipe implements PipeTransform {
	
	constructor(
		private _profileService: ProfileService,
		private _scholarshipService: ScholarshipService
	) {
	
	}
	
	transform(userId: string, forNode: string): any {
		if (!userId || userId.length === 0) {
			// create observable
			return new Observable((observer) => {
				observer.next('0');
			});
		} else {
			switch (forNode) {
				case 'peer':
					return this._profileService.getKarmaBalance(userId);
				case 'scholarship':
					return this._scholarshipService.getKarmaBalance(userId);
				default:
					return new Observable((observer) => {
						observer.next('0');
					});
			}
		}
	}

}
