import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleTeachingComponent } from '../console-teaching.component';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import * as moment from 'moment';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import {environment} from '../../../../environments/environment';
@Component({
	selector: 'app-console-teaching-session',
	templateUrl: './console-teaching-session.component.html',
	styleUrls: ['./console-teaching-session.component.scss', '../console-teaching.component.scss', '../../console.component.scss']
})

export class ConsoleTeachingSessionComponent implements OnInit {
	
	public loaded: boolean;
	public activeTab: string;
	public userId;
	public pastSessions: Array<any>;
	public ongoingSessions: Array<any>;
	public upcomingSessions: Array<any>;
	public notApproved: Array<any>;
	public sessionEnabled = false;
	public teacher: any;
	public envVariable;
	constructor(
		public activatedRoute: ActivatedRoute,
		public consoleTeachingComponent: ConsoleTeachingComponent,
		public router: Router,
		public _collectionService: CollectionService,
		private _cookieUtilsService: CookieUtilsService,
		private dialogsService: DialogsService
	) {
		this.envVariable = environment;
		activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
			console.log(urlSegment[0].path);
			consoleTeachingComponent.setActiveTab(urlSegment[0].path);
		});
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.loaded = false;
		this.fetchCollections();
	}
	
	private fetchCollections() {
		this.loaded = false;
		const filter = {
			'where': { 'type': 'session' },
			'include': [
				{
					relation: 'contents',
					scope: {
						include: [
							'availabilities',
							{'peers': 'profiles'},
							'packages',
							'payments'
						],
						order: 'createdAt DESC'
					},
				},
				{ 'owners': 'profiles' }
			]
		};
		this.pastSessions = [];
		this.ongoingSessions = [];
		this.upcomingSessions = [];
		this.notApproved = [];
		this._collectionService.getOwnedCollections(this.userId, JSON.stringify(filter), (err, res) => {
			if (res[0]) {
				this.sessionEnabled = true;
				this.teacher = res[0].owners[0];
				this.filterSessions(res[0].contents);
			}
			this.loaded = true;
		});
	}
	
	private filterSessions(contents: Array<any>) {
		contents.forEach(sessionInstance => {
			if (sessionInstance.availabilities && sessionInstance.availabilities.length > 0 && sessionInstance.packages && sessionInstance.packages.length > 0) {
				const availabilities = sessionInstance.availabilities.sort((calEventa, calEventb) => (moment(calEventa.startDateTime).isAfter(moment(calEventb.startDateTime)) ? 1 : -1));
				const startTime = moment(availabilities[0].startDateTime).local();
				const endTime = moment(availabilities[availabilities.length - 1].startDateTime).local().add(60, 'minutes');
				const now = moment();
				sessionInstance.isPaidFor = false;
				if (sessionInstance.payments && sessionInstance.payments.length > 0) {
					let paidAmount = 0;
					sessionInstance.payments.forEach(payment => {
						paidAmount += payment.amount;
					});
					if (paidAmount >= sessionInstance.packages[0].price) {
						sessionInstance.isPaidFor = true;
						sessionInstance.paymentPending = sessionInstance.packages[0].price - paidAmount;
					}
				} else {
					sessionInstance.paymentPending = sessionInstance.packages[0].price;
				}
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
				} else if (sessionInstance.sessionIsRejected) {
					console.log('Found rejected session');
				} else {
					this.notApproved.push(sessionInstance);
				}
			}
		});
	}
	
	public joinSession(session: any) {
		console.log(session);
	}
	
	public approveSession(session: any) {
		this._collectionService.approveSessionJoinRequest(session.id).subscribe(res => {
			this.fetchCollections();
		});
	}
	
	public rejectSession(session: any) {
		this._collectionService.rejectSessionJoinRequest(session.id).subscribe(res => {
			this.fetchCollections();
		});
	}
	
	/**
	 * joinLiveSession
	 */
	public joinLiveSession(session: any) {
		const data = {
			roomName: session.id,
			teacher: this.teacher,
			content: session,
			participants: session.peers
		};
		this.dialogsService.startLiveSession(data).subscribe(result => {
		});
	}
	
	public openTransactions() {
		this.router.navigate(['console', 'account', 'transactions']);
	}
	
}
