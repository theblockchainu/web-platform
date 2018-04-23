import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

@Injectable()
export class SpinnerService {
	spinnerState: BehaviorSubject<boolean>;
	
	constructor() {
		this.spinnerState = new BehaviorSubject(true);
	}
	
	getSpinnerState() {
		return this.spinnerState.asObservable();
	}
	
	setSpinnerState(value: boolean) {
		this.spinnerState.next(value);
	}
}
