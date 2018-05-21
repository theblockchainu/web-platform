import { Pipe, PipeTransform } from '@angular/core';
import {ProfileService} from '../../_services/profile/profile.service';
import {Observable} from 'rxjs/Observable';

@Pipe({
	name: 'gyanBalance'
})
export class GyanBalancePipe implements PipeTransform {
	
	constructor(
		private _profileService: ProfileService
	) {
	
	}
	
	transform(userId: string): any {
		if (!userId || userId.length === 0) {
			// create observable
			return new Observable((observer) => {
				observer.next('0');
			});
		} else {
			return this._profileService.getGyanBalance(userId);
		}
	}
	
}
