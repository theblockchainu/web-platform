import { Component, OnInit } from '@angular/core';
import { ConsoleAccountComponent } from '../console-account.component';
import { ActivatedRoute } from '@angular/router';
import { WalletService } from '../../../_services/wallet/wallet.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../../../_services/profile/profile.service';
import {DialogsService} from '../../../_services/dialogs/dialog.service';
import {MatSnackBar} from '@angular/material';
import {AuthenticationService} from '../../../_services/authentication/authentication.service';
import {KnowledgeStoryService} from '../../../_services/knowledge-story/knowledge-story.service';

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
	public blockTransactions = [];
	
	constructor(
		public consoleAccountComponent: ConsoleAccountComponent,
		public activatedRoute: ActivatedRoute,
		public _authService: AuthenticationService,
		private _walletService: WalletService,
		private _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		private _knowledgeStoryService: KnowledgeStoryService,
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
		const query = {};
		this._profileService.getPeerData(this.userId, query).subscribe(res => {
			this.peer = res;
			if (this.peer.ethAddress && this.peer.ethAddress.substring(0, 2) === '0x') {
				this.fetchBlockTransactions({});
			} else {
				this.loadingPeer = false;
			}
		}, err => {
			this.peer = {};
			this.loadingPeer = false;
		});
	}
	
	private fetchBlockTransactions(topics) {
		this.loadingPeer = true;
		this.blockTransactions = [];
		this._knowledgeStoryService.fetchBlockTransactions(this.peer.ethAddress, topics)
			.subscribe(
				(res: any) => {
					if (res && res.constructor === Array) {
						res.forEach(transaction => {
							if (transaction.result) {
								const resultObject = JSON.parse(transaction.result);
								if (resultObject.hasOwnProperty('logs')) {
									resultObject.logs.forEach(log => {
										if (log.event === 'Transfer') {
											this.blockTransactions.push(transaction);
										}
									});
								}
							}
						});
					} else {
						this.blockTransactions = [];
					}
					this.loadingPeer = false;
				},
				err => {
					this.loadingPeer = false;
					this.blockTransactions = [];
				}
			);
	}
	
	public toggleWalletId() {
		this.showWalletId = !this.showWalletId;
	}
	
	public fixWalletDialog() {
		this._dialogService.confirmPasswordDialog()
			.subscribe(res => {
				if (res) {
					this._walletService.fixWallet(this.userId, res)
						.subscribe((result: any) => {
								this.snackBar.open('Successfully updated wallet', 'Ok', { duration: 5000 });
								this.fetchTransactions();
								this._authService.isLoginSubject.next(true);
							},
							error => {
								this.snackBar.open('Error fixing wallet: ' + error.error.error.message, 'Close', { duration: 5000});
							});
				}
			});
	}
	
	public parseTransactionLog(result) {
		const parsedLog = {
			events: [],
			hash: '',
			timestamp: ''
		};
		const resultObject = JSON.parse(result);
		if (resultObject.hasOwnProperty('logs')) {
			resultObject.logs.forEach(log => {
				const value = log.args && log.args['value'] ? log.args['value'] : 0;
				// Only capture Transfer events
				const type = log.args && log.args['to'].toLowerCase() === this.peer.ethAddress.toLowerCase() ? 'debit' : 'credit';
				const name = log.args && log.args['from'] === '0' ? 'Reward' : log.event;
				parsedLog.events.push({name: name, args: log.args, type: type, amount: value});
				parsedLog.hash = log.transactionHash;
			});
		}
		console.log(parsedLog);
		return parsedLog;
	}
	
	/* Sample logs
	"{
		"tx":"0xfe018d4184e86f427bc2426890c7a858b9950c11e8dcb028069d7fb40206ce8a",
		"receipt":{
			"transactionHash":"0xfe018d4184e86f427bc2426890c7a858b9950c11e8dcb028069d7fb40206ce8a",
			"transactionIndex":0,
			"blockHash":"0xaa6017694c382c01f419f0c87c6c6287cb1440bc4b8eaf92e61a178b4004f366",
			"blockNumber":39,
			"gasUsed":74614,
			"cumulativeGasUsed":74614,
			"contractAddress":null,
			"logs":[
				{
					"logIndex":0,
					"transactionIndex":0,
					"transactionHash":"0xfe018d4184e86f427bc2426890c7a858b9950c11e8dcb028069d7fb40206ce8a",
					"blockHash":"0xaa6017694c382c01f419f0c87c6c6287cb1440bc4b8eaf92e61a178b4004f366",
					"blockNumber":39,
					"address":"0x8f0483125fcb9aaaefa9209d8e9d7b9c8b9fb90f",
					"type":"mined",
					"event":"ScholarshipJoin",
					"args":{
						"_id":"0x6439353865313633383762373437333039636461323462633936316635626462",
						"_participantAddress":"0x680fa2622aba8bfd617f5d5775edcc0b3101c67d",
						"pbNode":"0x92797c984f57b3acb092ec89c77241060d341e41"
					}
				}
			]
	*/
	
}
