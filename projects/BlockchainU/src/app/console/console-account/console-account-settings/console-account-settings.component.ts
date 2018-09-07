import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleAccountComponent } from '../console-account.component';
import { ProfileService } from '../../../_services/profile/profile.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { MatSnackBar } from '@angular/material';
import { AuthenticationService } from '../../../_services/authentication/authentication.service';
import { RequestHeaderService } from '../../../_services/requestHeader/request-header.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
@Component({
	selector: 'app-console-account-settings',
	templateUrl: './console-account-settings.component.html',
	styleUrls: ['./console-account-settings.component.scss']
})
export class ConsoleAccountSettingsComponent implements OnInit {

	public busyDeleteAccount = false;
	public loaded = true;
	public userId;

	constructor(
		public activatedRoute: ActivatedRoute,
		public consoleAccountComponent: ConsoleAccountComponent,
		public _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		public _MatSnackBar: MatSnackBar,
		private _Router: Router,
		private _AuthenticationService: AuthenticationService,
		private _RequestHeaderService: RequestHeaderService,
		private _dialogsService: DialogsService
	) {
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			console.log(urlSegment[0].path);
			consoleAccountComponent.setActiveTab(urlSegment[0].path);
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}

	ngOnInit() {
	}

	public deleteAccount() {
		this._dialogsService.confirmDeleteAccount(this.userId).subscribe(res => {
			console.log(res);
			if (res) {
				this._profileService.deletePeer(this.userId).subscribe(res => {
					this._MatSnackBar.open('Account Deleted. Redirecting', 'Close', {
						duration: 3000
					});
					this._cookieUtilsService.deleteValue('userId');
					this._cookieUtilsService.deleteValue('accountApproved');
					this._cookieUtilsService.deleteValue('access_token');
					this._cookieUtilsService.deleteValue('currency');
					this._AuthenticationService.isLoginSubject.next(false);
					this._RequestHeaderService.refreshToken.next(true);
					this._Router.navigate(['']);
				});
			}
		});

	}

}
