import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material';
import {KnowledgeStoryService} from '../../_services/knowledge-story/knowledge-story.service';
import {CollectionService} from '../../_services/collection/collection.service';
import {Meta, Title} from '@angular/platform-browser';
declare var FB: any;

@Component({
  selector: 'app-knowledge-story',
  templateUrl: './knowledge-story.component.html',
  styleUrls: ['./knowledge-story.component.scss']
})
export class KnowledgeStoryComponent implements OnInit {
	public loadingKnowledgeStory: boolean;
	public knowledgeStory: any;
	public knowledgeStoryId: string;
	public userId: string;
	public initialised = false;
	public accountApproved: string;
	public viewerApproved = false;
	public ownerView = false;
	public envVariable;
	constructor(
		private activatedRoute: ActivatedRoute,
		private _cookieUtilsService: CookieUtilsService,
		private _knowledgeStoryService: KnowledgeStoryService,
		public _collectionService: CollectionService,
		private router: Router,
		private titleService: Title,
		private metaService: Meta,
		private dialogsService: DialogsService,
		private matSnackBar: MatSnackBar
	) {
		this.envVariable = environment;
	}
	
	ngOnInit() {
		this.activatedRoute.params.subscribe(params => {
			if (this.initialised && (this.knowledgeStoryId !== params['storyId'])) {
				location.reload();
			}
			this.knowledgeStoryId = params['storyId'];
		});
		this.userId = this._cookieUtilsService.getValue('userId');
		this.initialised = true;
		this.initializePage();
		this.accountApproved = this._cookieUtilsService.getValue('accountApproved');
	}
	
	private setTags() {
		this.titleService.setTitle(this.knowledgeStory.protagonist[0].profiles[0].first_name + '\'s Knowledge Story');
		this.metaService.updateTag({
			property: 'og:title',
			content: this.knowledgeStory.protagonist[0].profiles[0].first_name + '\'s Knowledge Story'
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
			content: environment.apiUrl + this.knowledgeStory.protagonist[0].profiles[0].picture_url
		});
		this.metaService.updateTag({
			property: 'og:url',
			content: environment.clientUrl + this.router.url
		});
	}
	
	
	
	initializePage() {
		const filter = {
			'include': [{ 'protagonist': 'profiles' },
				{'peer': 'profiles'},
				'topics'
				]
		};
		this._knowledgeStoryService.fetchKnowledgeStory(this.knowledgeStoryId, filter)
			.subscribe((res: any) => {
				this.knowledgeStory = res;
				console.log(this.knowledgeStory);
				if (this.knowledgeStory.protagonist[0].id === this.userId) {
					this.ownerView = true;
				}
				for (let index = 0; (!this.viewerApproved && index < this.knowledgeStory.peer.length); index++) {
					const peer = this.knowledgeStory.peer[index];
					if (peer.id === this.userId) {
						this.viewerApproved = true;
					}
				}
				this.setTags();
			});
	}
	
	openCollection(collection: any) {
		this.router.navigateByUrl('/' + collection.type + '/' + collection.id);
	}
	
	public openInviteFriendsDialog() {
		const shareObject = this.knowledgeStory;
		shareObject.type = 'story';
		this.dialogsService.inviteFriends(shareObject);
	}
	
	
	public shareOnFb() {
		FB.ui({
			method: 'share_open_graph',
			action_type: 'og.shares',
			action_properties: JSON.stringify({
				object: {
					'og:url': environment.clientUrl + this.router.url, // your url to share
					'og:title': 'Knowledge story of ' + this.knowledgeStory.protagonist[0].profiles[0].first_name + ' ' + this.knowledgeStory.protagonist[0].profiles[0].last_name,
					'og:site_name': 'Peerbuds',
					'og:description': 'Topics: ' + this.knowledgeStory.topics.toString()
				}
			})
		}, function (response) {
			console.log('response is ', response);
		});
	}

}
