import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'shortNumber'
})
export class ShortNumberPipe implements PipeTransform {
	
	transform(number: any): any {
		if (number === 0) {
			return 0;
		} else {
			// hundreds
			if (number <= 999) {
				return number ;
			} else if (number >= 1000 && number <= 999999) {
				return Math.round((number / 1000)) + 'K';
			} else if (number >= 1000000 && number <= 999999999) {
				return Math.round((number / 1000000)) + 'M';
			} else if (number >= 1000000000 && number <= 999999999999) {
				return Math.round((number / 1000000000)) + 'B';
			} else {
				return number ;
			}
		}
	}
	
}
