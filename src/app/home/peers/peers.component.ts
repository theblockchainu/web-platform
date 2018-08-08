import { Component, OnInit, ViewChild } from '@angular/core';
import { CollectionService } from '../../_services/collection/collection.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { MatDialog } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TopicService } from '../../_services/topic/topic.service';
import * as _ from 'lodash';
import { TitleCasePipe } from '@angular/common';
import { map } from 'rxjs/operators';

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
	public peersbackup: Array<any>;

	public availableTopics: Array<any>;
	public userId;
	public loading = false;
	public envVariable;
	public topicsBackup: Array<any>;
	public selectedTopics: Array<any>;

	@ViewChild('topicButton') topicButton;
	@ViewChild('priceButton') priceButton;
	constructor(
		public _collectionService: CollectionService,
		public _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		private titleService: Title,
		private metaService: Meta,
		private router: Router,
		public dialog: MatDialog,
		private _topicService: TopicService,
		private titlecasepipe: TitleCasePipe
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}

	ngOnInit() {
		this.fetchData();
	}

	private fetchData() {
		this.fetchTopics();
		this.setTags();
	}

	private setTags() {
		this.titleService.setTitle('Peers');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Explore Peers'
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

		this.selectedTopics = [];
		for (const topicObj of this.availableTopics) {
			if (topicObj['checked']) {
				this.selectedTopics.push({ 'name': topicObj['topic'].name });
			}
		}

		let query;

		if (this.selectedTopics && this.selectedTopics.length < 1) {
			query = {
				'include': [
					{
						'relation': 'peersTeaching',
						'scope':
						{
							'include':
								[
									{
										'relation': 'ownedCollections',
										'scope': {
											'where': { 'type': 'session' }
										}
									},
									'reviewsAboutYou',
									'wallet',
									'profiles',
									'topicsTeaching'
								]

						}
					}
				],
				'limit': 50
			};
		} else {
			query = {
				'include': [
					{
						'relation': 'peersTeaching',
						'scope':
						{
							'include':
								[
									{
										'relation': 'ownedCollections',
										'scope': {
											'where': { 'type': 'session' }
										}
									},
									'reviewsAboutYou',
									'profiles',
									'topicsTeaching'
								]

						}
					}
				],
				'where': { or: this.selectedTopics },
				'limit': 50,
			};
		}

		this.loading = true;
		this._topicService.getTopics(query)
			.subscribe(
				(response: any) => {
					const peers = [];
					response.forEach(topic => {
						topic.peersTeaching.forEach(peer => {
							if (peer.id !== this.userId && peer.ownedCollections && peer.ownedCollections.length > 0) {
								peer.rating = this._collectionService.calculateRating(peer.reviewsAboutYou);
								const topics = [];
								peer.topicsTeaching.forEach(topicObj => {
									topics.push(this.titlecasepipe.transform(topicObj.name));
								});
								if (topics.length > 0) {
									peer.topics = topics;
								} else {
									topics.push('No topic selected');
									peer.topics = topics;
								}
								peers.push(peer);
							}
						});
					});
					this.peers = _.uniqBy(peers, 'id');
					this.peersbackup = _.cloneDeep(this.peers);
					this.loading = false;
				}, (err) => {
					console.log(err);
				}
			);
	}

	fetchTopics() {
		const query = {
			order: 'name ASC'
		};
		this._topicService.getTopics(query).pipe(
			map(
				(response: any) => {
					const availableTopics = [];
					response.forEach(topic => {
						availableTopics.push({ 'topic': topic, 'checked': false });
					});
					return availableTopics;
				}, (err) => {
					console.log(err);
				}
			)
		).subscribe(response => {
			this.loading = false;
			this.availableTopics = response;
			this.topicsBackup = _.cloneDeep(response);
			this.fetchPeers();
		});
	}

	public filterClickedTopic(index) {
		this.availableTopics = _.cloneDeep(this.topicsBackup);
		this.availableTopics[index]['checked'] = true;
		this.fetchPeers();
	}

	public resetTopics() {
		this.availableTopics = _.cloneDeep(this.topicsBackup);
		this.fetchPeers();
	}

}
