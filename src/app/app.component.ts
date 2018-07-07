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

import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	providers: [SpinnerService]
})
export class AppComponent implements OnInit {
	title = 'app';
	public activePath = 'home';
	showHeader = true;
	showFooter = true;
	showProgressbar = true;
	// Sets initial value to true to show loading spinner on first load
	public loading: Observable<boolean>;

	constructor(private router: Router,
		private _spinnerService: SpinnerService,
		private _socketService: SocketService,
		private _authService: AuthenticationService,
		private titleService: Title
	) {
	}

	ngOnInit() {
		this.loading = this._spinnerService.getSpinnerState();
		this.router.events.subscribe((event: RouterEvent) => {
			this.navigationInterceptor(event);
		});
		this.router.events.subscribe(event => this.modifyHeader(event));
		this.router.events.subscribe(event => this.modifyFooter(event));
		this.router.events.subscribe(event => this.triggerAnalytics(event));
		this.setTitle('Peerbuds - Immersive & Incentivized Education');
	}

	public triggerAnalytics(event) {
		if (event instanceof NavigationEnd) {
			(<any>window).ga('set', 'page', event.urlAfterRedirects);
			(<any>window).ga('send', 'pageview');
		}
	}

	modifyFooter(location) {
		this.showFooter = !(
			/^\/verification\/.*./.test(location.url)
			|| /^\/onboarding\/.*./.test(location.url)
			|| /\/console\/inbox\/.*./.test(location.url)
			|| /^\/class\/.*\/edit\/./.test(location.url)
			|| /^\/experience\/.*\/edit\/./.test(location.url)
			|| /^\/session\/.*\/edit\/./.test(location.url));
		
	}

	modifyHeader(location) {
		this.showHeader = !(
			/^\/class\/.*\/edit\/./.test(location.url)
			|| /^\/experience\/.*\/edit\/./.test(location.url)
			|| /^\/session\/.*\/edit\/./.test(location.url)
			|| /^\/error/.test(location.url));
		this.showHeader = (this.router.url !== '/');
		this.showProgressbar = (this.router.url !== '/');
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
