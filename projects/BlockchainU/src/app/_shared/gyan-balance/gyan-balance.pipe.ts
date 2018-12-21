import { Pipe, PipeTransform } from '@angular/core';
import { ProfileService } from '../../_services/profile/profile.service';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Pipe({
	name: 'gyanBalance'
})
export class GyanBalancePipe implements PipeTransform {

	constructor(
		private _profileService: ProfileService
	) {

	}

	transform(userId: string, type = 'floating', convertTo = 'GYAN'): any {
		if (!userId || userId.length === 0) {
			// create observable
			return new Observable((observer) => {
				observer.next('0');
			});
		} else {
			if (convertTo === 'USD') {
				return this._profileService.getPotentialKarmaRewards(userId, convertTo).pipe(
					map((val: any) => {
						if (typeof val === 'number' || typeof val === 'string') {
							return val;
						} else {
							return 0;
						}
					}),
					catchError(err => {
						return new Observable(obs => {
							obs.next(0);
							obs.complete();
						});
					})
				);
			}
			return this._profileService.getGyanBalance(userId, type).pipe(
				map((val: any) => {
					if (typeof val === 'number' || typeof val === 'string') {
						return val;
					} else {
						return 0;
					}
				}),
				catchError(err => {
					return new Observable(obs => {
						obs.next(0);
						obs.complete();
					});
				})
			);
		}
	}

}
