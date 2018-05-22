import { Component, OnInit } from '@angular/core';
import { ConsoleAccountComponent } from '../console-account.component';
import { ActivatedRoute } from '@angular/router';
import { WalletService } from '../../../_services/wallet/wallet.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../../../_services/profile/profile.service';
import {DialogsService} from '../../../_services/dialogs/dialog.service';
import {MatSnackBar} from '@angular/material';

@Component({
	selector: 'app-console-account-wallet',
	templateUrl: './console-account-wallet.component.html',
	styleUrls: ['./console-account-wallet.component.scss']
})
export class ConsoleAccountWalletComponent implements OnInit {
	
	public showWalletId = false;
	private userId: string;
	public peer: any;
	public loadingPeer = true;
	
	constructor(
		public consoleAccountComponent: ConsoleAccountComponent,
		public activatedRoute: ActivatedRoute,
		private _walletService: WalletService,
		private _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		private snackBar: MatSnackBar,
		private _dialogService: DialogsService
	) {
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			console.log(urlSegment[0].path);
			consoleAccountComponent.setActiveTab(urlSegment[0].path);
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.fetchTransactions();
	}
	
	private fetchTransactions() {
		this.loadingPeer = true;
		const query = {
			'include': [
				{
					'token_transactions': [
						'collections',
						'communities',
						'contents',
						'peers'
					]
				}
			]
		};
		this._profileService.getPeerData(this.userId, query).subscribe(res => {
			this.peer = res;
			this.loadingPeer = false;
		}, err => {
			this.peer = {};
		});
	}
	
	public toggleWalletId() {
		this.showWalletId = !this.showWalletId;
	}
	
	public fixWalletDialog() {
		this._dialogService.confirmPasswordDialog()
			.subscribe(res => {
				this._walletService.fixWallet(this.userId, res)
					.subscribe(result => {
						this.snackBar.open('Successfully updated wallet', 'Ok', { duration: 5000 });
						this.fetchTransactions();
					},
						error => {
						this.snackBar.open('Error fixing wallet: ' + error.error.error.message, 'Close', { duration: 5000});
						});
			});
	}
	
}
