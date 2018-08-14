import { environment } from '../../../environments/environment';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import * as moment from 'moment';
import { CookieService } from 'ngx-cookie-service';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class CookieUtilsService {
	public envVariable;
	private options;
	public isBrowser: boolean;
	constructor(
		public _cookieService: CookieService,
		@Inject(PLATFORM_ID) platformId: string
	) {
		this.envVariable = environment;
		this.isBrowser = isPlatformBrowser(platformId);
	}

	public getValue(key: string) {
		if (this.isBrowser) {
			const cookieValueCrypt = this._cookieService.get(key);
			if (cookieValueCrypt) {
				const cookieValue = cookieValueCrypt.split(/[ \:.]+/);
				console.log('getting cookie value of ' + key + ' as : ' + cookieValue);
				return cookieValue.length > 1 ? cookieValue[1] : cookieValue[0];
			} else {
				return '';
			}
		} else {
			return '';
		}

	}

	public setValue(name: string, value: string) {
		this._cookieService.delete(name, '/', environment.host);
		this._cookieService.set(name, value, moment().add(2, 'days').toDate(), '/', environment.host);
	}

	public deleteValue(key) {
		this._cookieService.delete(key, '/', environment.host);
	}

}
