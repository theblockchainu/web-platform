import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsoleComponent } from '../console.component';
import { CollectionService } from '../../_services/collection/collection.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { MatSnackBar } from '@angular/material';
import {environment} from '../../../environments/environment';

declare var moment: any;


@Component({
	selector: 'app-console-admin',
	templateUrl: './console-admin.component.html',
	styleUrls: ['./console-admin.component.scss']
})
export class ConsoleAdminComponent implements OnInit {
	public collectionsLoaded: boolean;
	public unapprovedCollections: Array<any>;
	public unapprovedPeers;
	public peersLoaded: boolean;
	public envVariable;
	public emailSubscriptions: Array<any>;
	public emailSubLoaded: boolean;
	public connectedIdentities;
	public verifiedItems;
	public displayedColumns = ['createdAt', 'email'];
	constructor(
		activatedRoute: ActivatedRoute,
		consoleComponent: ConsoleComponent,
		public _collectionService: CollectionService,
		public _profileService: ProfileService,
		public snackBar: MatSnackBar,
	) {
		this.envVariable = environment;
		activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
			console.log(urlSegment[0].path);
			consoleComponent.setActiveTab(urlSegment[0].path);
		});
	}
	
	ngOnInit() {
		this.fetchCollections();
		this.fetchPeers();
		this.fetchEmailSubscriptions();
	}
	
	private fetchEmailSubscriptions() {
		this.emailSubLoaded = false;
		const filter = {
			order: 'createdAt DESC'
		};
		this._profileService.getEmailSubscriptions(filter).subscribe(result => {
			this.emailSubscriptions = result;
			this.emailSubLoaded = true;
		});
	}
	
	private fetchPeers() {
		this.peersLoaded = false;
		this.connectedIdentities = {
			'facebook': false,
			'google': false
		};
		this.connectedIdentities = {
			'phone': false,
			'email': false,
			'id': false
		};
		const query = {
			'where': { 'accountVerified': 'false' },
			'include': [
				'profiles', 'identities', 'credentials'
			],
			'order': 'createdAt DESC'
		};
		this._profileService.getAllPeers(query).subscribe((result: any) => {
			this.unapprovedPeers = result;
			if (this.unapprovedPeers) {
				if (this.unapprovedPeers.identities && this.unapprovedPeers.identities.length > 0) {
					this.unapprovedPeers.identities.forEach(element => {
						if (element.provider === 'google') {
							this.connectedIdentities.google = true;
						} else if (element.provider === 'facebook') {
							this.connectedIdentities.facebook = true;
						}
					});
				}
				if (this.unapprovedPeers.credentials && this.unapprovedPeers.credentials.length > 0) {
					this.unapprovedPeers.credentials.forEach(element => {
						if (element.provider === 'google') {
							this.connectedIdentities.google = true;
						} else if (element.provider === 'facebook') {
							this.connectedIdentities.facebook = true;
						}
					});
				}
			}
			this.peersLoaded = true;
		}, err => {
			console.log(err);
		});
	}
	
	private fetchCollections() {
		this.collectionsLoaded = false;
		const query = {
			'where': { 'isApproved': false, 'status': 'submitted' },
			'include': [
				'calendars',
				{'owners': ['profiles', 'topicsTeaching']}
			],
			'order': 'submittedAt DESC'
		};
		this._collectionService.getAllCollections(query).subscribe(
			(result: any) => {
				this.unapprovedCollections = result;
				this.collectionsLoaded = true;
			}, err => {
				console.log(err);
			}
		);
	}
	
	public approveWorkshop(collection: any) {
		
		this._collectionService.approveCollection(collection).subscribe(
			(result: any) => {
				if (result) {
					this.fetchCollections();
					this.snackBar.open(result.result, 'Close', {
						duration: 5000
					}).onAction().subscribe();
				}
			}, err => {
				console.log(err);
			}
		);
	}
	
	public rejectWorkshop(collection: any) {
		
		this._collectionService.rejectCollection(collection).subscribe(
			(result: any) => {
				if (result) {
					this.fetchCollections();
					this.snackBar.open(result.result, 'Close', {
						duration: 5000
					}).onAction().subscribe();
				}
			}, err => {
				console.log(err);
			}
		);
	}
	
	/**
	 * approvePeer
	 */
	public approvePeer(peer) {
		this._profileService.approvePeer(peer).subscribe((result: any) => {
			if (result) {
				this.fetchPeers();
				this.snackBar.open(result.result, 'Close', {
					duration: 5000
				}).onAction().subscribe();
			}
			
		}, err => {
			console.log(err);
		});
	}
	
	/**
	 * rejectPeer
	 */
	public rejectPeer(peer) {
		this._profileService.rejectPeer(peer).subscribe((result: any) => {
			if (result) {
				this.fetchPeers();
				this.snackBar.open(result.result, 'Close', {
					duration: 5000
				}).onAction().subscribe();
			}
			
		}, err => {
			console.log(err);
		});
	}
	
}
