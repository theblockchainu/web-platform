import { Component, OnInit, ViewChild } from '@angular/core';
import { CollectionService } from '../../_services/collection/collection.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { MatDialog } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {environment} from '../../../environments/environment';
import {Meta, Title} from '@angular/platform-browser';
import {Router} from '@angular/router';

@Component({
	selector: 'app-peers',
	templateUrl: './peers.component.html',
	styleUrls: ['./peers.component.scss'],
	animations: [
		trigger('slideInOut', [
			state('in', style({
				transform: 'translate3d(0, 0, 0)'
			})),
			state('out', style({
				transform: 'translate3d(100%, 0, 0)'
			})),
			transition('in => out', animate('400ms ease-in-out')),
			transition('out => in', animate('400ms ease-in-out'))
		]),
	]
})
export class PeersComponent implements OnInit {
	public peers: Array<any>;
	public availableTopics: Array<any>;
	public userId;
	public loading = false;
	public envVariable;
	
	@ViewChild('topicButton') topicButton;
	@ViewChild('priceButton') priceButton;
	constructor(
		public _collectionService: CollectionService,
		public _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		private titleService: Title,
		private metaService: Meta,
		private router: Router,
		public dialog: MatDialog
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.fetchPeers();
		this.setTags();
	}
	
	private setTags() {
		this.titleService.setTitle('Peers');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Explore Peers'
		});
		this.metaService.updateTag({
			property: 'og:description',
			content: 'Peerbuds is an open decentralized protocol that tracks everything you have ever learned in units called Gyan and rewards it with tokens called Karma.'
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'peerbuds.com'
		});
		this.metaService.updateTag({
			property: 'og:image',
			content: 'https://peerbuds.com/pb_logo_square.png'
		});
		this.metaService.updateTag({
			property: 'og:url',
			content: environment.clientUrl + this.router.url
		});
	}
	
	fetchPeers() {
		const query = {
			'include': [
				'reviewsAboutYou',
				'profiles'
			],
			'limit': 50
		};
		this.loading = true;
		this._profileService.getAllPeers(query).subscribe((result: any) => {
			this.loading = false;
			this.peers = [];
			for (const responseObj of result) {
				if (responseObj.id !== this.userId) {
					responseObj.rating = this._collectionService.calculateRating(responseObj.reviewsAboutYou);
					this.peers.push(responseObj);
				}
			}
		}, (err) => {
			console.log(err);
		});
	}
}
