import { Component, OnInit, NgModule } from '@angular/core';
import {
	Router,
	// import as RouterEvent to avoid confusion with the DOM Event
	Event as RouterEvent,
	NavigationStart,
	NavigationEnd,
	NavigationCancel,
	NavigationError
} from '@angular/router';

import { SpinnerService } from './_services/spinner/spinner.service';
import { SocketService } from './_services/socket/socket.service';

import { AuthenticationService } from './_services/authentication/authentication.service';
import { Title } from '@angular/platform-browser';
import { CookieUtilsService } from './_services/cookieUtils/cookie-utils.service';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	providers: [SpinnerService]
})
export class AppComponent implements OnInit {
	title = 'app';
	public activePath = 'home';
	public showHeader: boolean;
	public showFooter: boolean;
	// showProgressbar = true;
	// Sets initial value to true to show loading spinner on first load
	public loading: Observable<boolean>;

	constructor(private router: Router,
		private _spinnerService: SpinnerService,
		private _socketService: SocketService,
		private _authService: AuthenticationService,
		private titleService: Title,
		private cookieService: CookieUtilsService
	) {
	}

	ngOnInit() {
		this.setTitle('The Blockchain University - World largest community of Blockchain Certified Professionals');
		this.loading = this._spinnerService.getSpinnerState();
		this.router.events.subscribe((event: RouterEvent) => {
			this.showHeader = true;
			this.showFooter = true;
			if (this.cookieService.isBrowser) {
				this.navigationInterceptor(event);
			}
			this.modifyHeader(this.router.url);
			this.modifyFooter(this.router.url);
		});
	}

	modifyFooter(url) {
		this.showFooter = !(
			/^\/verification\/.*./.test(url)
			|| /^\/onboarding\/.*./.test(url)
			|| /\/console\/inbox\/.*./.test(url)
			|| /^\/class\/.*\/edit\/./.test(url)
			|| /^\/experience\/.*\/edit\/./.test(url)
			|| /^\/session\/.*\/edit\/./.test(url));
	}

	modifyHeader(url) {
		this.showHeader = !(
			/^\/class\/.*\/edit\/./.test(url)
			|| /^\/experience\/.*\/edit\/./.test(url)
			|| /^\/session\/.*\/edit\/./.test(url)
			|| /^\/digest\/.*./.test(url)
			|| /^\/error/.test(url));
		if (url === '/' || url === '/login') {
			this.showHeader = false;
		}
	}

	public setTitle(newTitle: string) {
		this.titleService.setTitle(newTitle);
	}

	// Shows and hides the loading spinner during RouterEvent changes
	navigationInterceptor(event: RouterEvent): void {
		if (event instanceof NavigationStart) {
			this._spinnerService.setSpinnerState(true);
			// this.loading = this._spinnerService.getSpinnerState();
		}
		if (event instanceof NavigationEnd) {
			this._spinnerService.setSpinnerState(false);
			// this.loading = this._spinnerService.getSpinnerState();
		}

		// Set loading state to false in both of the below events to hide the spinner in case a request fails
		if (event instanceof NavigationCancel) {
			this._spinnerService.setSpinnerState(false);
			// this.loading = this._spinnerService.getSpinnerState();
		}
		if (event instanceof NavigationError) {
			this._spinnerService.setSpinnerState(false);
			// this.loading = this._spinnerService.getSpinnerState();
		}
	}
}
