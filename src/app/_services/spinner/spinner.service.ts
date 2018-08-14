import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SpinnerService {
	public spinnerState: BehaviorSubject<boolean>;

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
