import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleLearningComponent } from '../console-learning.component';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { ProfileService } from '../../../_services/profile/profile.service';
import * as moment from 'moment';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { environment} from '../../../../environments/environment';
import {ContentService} from '../../../_services/content/content.service';
import {MatSnackBar} from '@angular/material';

@Component({
	selector: 'app-console-learning-sessions',
	templateUrl: './console-learning-sessions.component.html',
	styleUrls: ['./console-learning-sessions.component.scss', '../../console.component.scss']
})
export class ConsoleLearningSessionsComponent implements OnInit {
	
	public loaded: boolean;
	public activeTab: string;
	public userId;
	public pastSessions = [];
	public ongoingSessions = [];
	public upcomingSessions = [];
	public notApproved = [];
	public participant: any;
	public envVariable;
	constructor(
		public activatedRoute: ActivatedRoute,
		public consoleLearningComponent: ConsoleLearningComponent,
		public _collectionService: CollectionService,
		public _contentService: ContentService,
		public router: Router,
		private _cookieUtilsService: CookieUtilsService,
		public _profileService: ProfileService,
		private dialogsService: DialogsService,
		private snackBar: MatSnackBar
	) {
		this.envVariable = environment;
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			console.log(urlSegment[0].path);
			consoleLearningComponent.setActiveTab(urlSegment[0].path);
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.refreshData();
	}
	
	private refreshData() {
		this.loaded = false;
		this.pastSessions = [];
		this.ongoingSessions = [];
		this.upcomingSessions = [];
		this.notApproved = [];
		this.loaded = false;
		const filter = {
			'include': [
				{
					relation: 'contents',
					scope: {
						include: [
							'availabilities',
							'packages',
							'payments',
							{ 'collections': [{ 'owners': 'profiles' }] }
						],
						order: 'createdAt DESC'
					}
				},
				'profiles'
			]
		};
		
		this._profileService.getPeerData(this.userId, filter).subscribe(res => {
			this.participant = res;
			this.filterSessions(res.contents);
			this.loaded = true;
		});
	}
	
	private filterSessions(contents: Array<any>) {
		contents.forEach(sessionInstance => {
			if (sessionInstance.availabilities && sessionInstance.availabilities.length > 0 && sessionInstance.packages && sessionInstance.packages.length > 0) {
				const availabilities = sessionInstance.availabilities.sort((calEventa, calEventb) => (moment(calEventa.startDateTime).isAfter(moment(calEventb.startDateTime)) ? 1 : -1));
				sessionInstance.isPaidFor = false;
				if (sessionInstance.payments && sessionInstance.payments.length > 0) {
					let paidAmount = 0;
					sessionInstance.payments.forEach(payment => {
						paidAmount += payment.amount;
					});
					if (paidAmount >= sessionInstance.packages[0].price) {
						sessionInstance.isPaidFor = true;
					} else {
						sessionInstance.pendingAmount = sessionInstance.packages[0].price - paidAmount;
						sessionInstance.pendingAmountCurrency = sessionInstance.packages[0].currency;
						sessionInstance.pendingPaymentTime = moment(sessionInstance.updatedAt).add(1, 'day').toNow(true);
						sessionInstance.paymentPossible = moment(sessionInstance.updatedAt).add(1, 'day').diff(moment()) > 0;
					}
				} else {
					sessionInstance.pendingAmount = sessionInstance.packages[0].price;
					sessionInstance.pendingAmountCurrency = sessionInstance.packages[0].currency;
					sessionInstance.pendingPaymentTime = moment(sessionInstance.updatedAt).add(1, 'day').fromNow(true);
					sessionInstance.paymentPossible = moment(sessionInstance.updatedAt).add(1, 'day').diff(moment()) > 0;
				}
				const startTime = moment(availabilities[0].startDateTime).local();
				const endTime = moment(availabilities[availabilities.length - 1].startDateTime).local().add(60, 'minutes');
				const now = moment();
				sessionInstance.startTime = startTime.toDate();
				sessionInstance.endTime = endTime.toDate();
				if (sessionInstance.sessionIsApproved) {
					if (now.isBetween(startTime, endTime)) {
						this.ongoingSessions.push(sessionInstance);
					} else if (now.isBefore(startTime)) {
						this.upcomingSessions.push(sessionInstance);
					} else {
						this.pastSessions.push(sessionInstance);
					}
				} else {
					this.notApproved.push(sessionInstance);
				}
			}
		});
		this.loaded = true;
	}
	
	public getEndTime(time: string): string {
		return moment(time).add(60, 'minutes').toISOString();
	}
	
	/**
	 * joinLiveSession
	 */
	public joinLiveSession(session: any) {
		const data = {
			roomName: session.id,
			teacher: session.collections[0].owners[0],
			content: session,
			participants: [this.participant]
		};
		this.dialogsService.startLiveSession(data).subscribe((result: any) => {
		});
	}
	
	public makePayment(session: any) {
		this.router.navigate(['session', 'book', session.collections[0].owners[0].id, 'payment', session.id]);
	}
	
	public cancelSessionRequest(session: any) {
		this._contentService.deleteContent(session.id).subscribe(res => {
			this.refreshData();
			this.snackBar.open('Your peer session request has been cancelled. The teacher has been informed.', 'Ok', { duration: 5000});
		});
	}
	
	public openTransactions() {
		this.router.navigate(['console', 'account', 'transactions']);
	}
}
