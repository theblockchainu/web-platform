import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsoleAccountComponent } from '../console-account.component';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { ProfileService } from '../../../_services/profile/profile.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { PaymentService } from '../../../_services/payment/payment.service';

@Component({
	selector: 'app-console-account-paymentmethods',
	templateUrl: './console-account-paymentmethods.component.html',
	styleUrls: ['./console-account-paymentmethods.component.scss']
})
export class ConsoleAccountPaymentmethodsComponent implements OnInit {
	
	public userId;
	public createSourceData = { token: '', email: '' };
	public custId: string;
	public listAllCards: Array<any>;
	public loadingCards: boolean;
	constructor(
		public activatedRoute: ActivatedRoute,
		public consoleAccountComponent: ConsoleAccountComponent,
		public dialogService: DialogsService,
		public profileService: ProfileService,
		private cookieUtilsService: CookieUtilsService,
		public paymentService: PaymentService,
		private _cookieUtilsService: CookieUtilsService
	) {
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			console.log(urlSegment[0].path);
			consoleAccountComponent.setActiveTab(urlSegment[0].path);
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.fetchCards();
	}
	
	private fetchCards() {
		this.loadingCards = true;
		this.profileService.getPeerData(this.userId).subscribe((peer: any) => {
			if (peer) {
				this.createSourceData.email = peer.email;
				if (peer.stripeCustId) {
					this.custId = peer.stripeCustId;
					// get all cards
					this.paymentService.listAllCards(this.userId, this.custId).subscribe((cards: any) => {
						if (cards) {
							this.listAllCards = cards.data;
							console.log(this.listAllCards);
							this.loadingCards = false;
						}
					});
				} else {
					this.loadingCards = false;
					console.log('Stripe account not created');
				}
				
			}
		});
	}
	
	public addCard() {
		this.dialogService.addCard().subscribe((result: any) => {
			if (result) {
				this.createSourceData.token = result.token.id;
				this.paymentService.createSource(this.userId, this.custId, this.createSourceData).subscribe((res: any) => {
					if (res) {
						console.log(res);
						this.fetchCards();
					}
				});
			}
		}, err => {
			console.log(err);
		});
	}
	
	public deleteCard(cardId: string) {
		this.paymentService.deleteCard(this.userId, this.custId, cardId).subscribe((res: any) => {
			if (res) {
				console.log(res);
				this.fetchCards();
			}
		});
		
	}
}
