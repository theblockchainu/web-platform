import { Component, OnInit } from '@angular/core';
import { ConsoleAccountComponent } from '../console-account.component';
import { ActivatedRoute } from '@angular/router';
import { WalletService } from '../../../_services/wallet/wallet.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../../../_services/profile/profile.service';

@Component({
	selector: 'app-console-account-wallet',
	templateUrl: './console-account-wallet.component.html',
	styleUrls: ['./console-account-wallet.component.scss']
})
export class ConsoleAccountWalletComponent implements OnInit {
	
	public wallet: any;
	public showWalletId = false;
	private userId: string;
	public peer: any;
	public loadingWallet = true;
	public loadingPeer = true;
	
	constructor(
		public consoleAccountComponent: ConsoleAccountComponent,
		public activatedRoute: ActivatedRoute,
		private _walletService: WalletService,
		private _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
	) {
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			console.log(urlSegment[0].path);
			consoleAccountComponent.setActiveTab(urlSegment[0].path);
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.fetchWallet();
		this.fetchTransactions();
	}
	
	private fetchWallet() {
		this.loadingWallet = true;
		this._walletService.getWallet().subscribe(res => {
			if (res && res.length > 0) {
				this.wallet = res[0];
				this.loadingWallet = false;
			} else {
				this.wallet = {};
				this.loadingWallet = false;
			}
		}, err => {
			this.wallet = {};
			this.loadingWallet = false;
		});
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
	
}
