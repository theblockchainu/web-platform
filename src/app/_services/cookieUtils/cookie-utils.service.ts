import {environment} from '../../../environments/environment';
import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {CookieService} from 'ngx-cookie-service';

@Injectable()
export class CookieUtilsService {
	public envVariable;
	private options;
	constructor(
		public _cookieService: CookieService
	) {
		this.envVariable = environment;
	}
	
	public getValue(key: string) {
		const cookieValueCrypt = this._cookieService.get(key);
		if (cookieValueCrypt) {
			const cookieValue = cookieValueCrypt.split(/[ \:.]+/);
			console.log('getting cookie value of ' + key + ' as : ' + cookieValue);
			return cookieValue.length > 1 ? cookieValue[1] : cookieValue[0];
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
