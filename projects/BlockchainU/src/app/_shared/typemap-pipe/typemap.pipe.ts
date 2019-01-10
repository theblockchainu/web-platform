import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'typeMap'
})
export class TypeMapPipe implements PipeTransform {
	
	transform(inputType: any, args?: any): any {
		switch (inputType) {
			case 'experience':
				return 'in-person workshop';
			case 'class':
				return 'online course';
			case 'guide':
				return 'learning guide';
			case 'bounty':
				return 'reward bounty';
			default:
				return inputType;
		}
	}
	
}
