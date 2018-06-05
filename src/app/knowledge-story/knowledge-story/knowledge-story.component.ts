import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar, MAT_SNACK_BAR_DATA } from '@angular/material';
import { KnowledgeStoryService } from '../../_services/knowledge-story/knowledge-story.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { Meta, Title } from '@angular/platform-browser';
import { AuthenticationService } from '../../_services/authentication/authentication.service';

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
	public pageUrl: string;
	public storyNotFound = false;
	public requested: boolean;
	constructor(
		private activatedRoute: ActivatedRoute,
		private _cookieUtilsService: CookieUtilsService,
		private _knowledgeStoryService: KnowledgeStoryService,
		public _collectionService: CollectionService,
		private router: Router,
		private titleService: Title,
		private metaService: Meta,
		public dialogsService: DialogsService,
		private matSnackBar: MatSnackBar,
		public authService: AuthenticationService,
	) {
		this.envVariable = environment;
	}

	ngOnInit() {
		this.authService.isLoginSubject.subscribe(res => {
			this.initializePage();
		});
		this.userId = this._cookieUtilsService.getValue('userId');
		this.accountApproved = this._cookieUtilsService.getValue('accountApproved');
		this.activatedRoute.params.subscribe(params => {
			if (this.initialised && (this.knowledgeStoryId !== params['storyId'])) {
				location.reload();
			}
			this.knowledgeStoryId = params['storyId'];
			this.initialised = true;
			this.initializePage();
		});
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
		delete this.knowledgeStory;
		this.loadingKnowledgeStory = true;
		this.pageUrl = environment.clientUrl + this.router.url;
		const filter = {
			'include': [
				{ 'protagonist': { 'profiles': ['work', 'education'] } },
				{ 'peer': ['profiles', 'reviewsAboutYou', 'ownedCollections'] },
				'topics',
				{ 'requests': ['profiles', 'reviewsAboutYou', 'ownedCollections'] },
			]
		};
		this.storyNotFound = false;
		if (this.knowledgeStoryId) {
			this._knowledgeStoryService.fetchKnowledgeStory(this.knowledgeStoryId, filter)
				.subscribe((res: any) => {
					this.knowledgeStory = res;
					console.log(this.knowledgeStory);
					if (this.knowledgeStory.protagonist[0].id === this.userId) {
						this.ownerView = true;
					}
					if (this.knowledgeStory.visibility === 'public') {
						this.viewerApproved = true;
					} else {
						for (let index = 0; (!this.viewerApproved && index < this.knowledgeStory.peer.length); index++) {
							const peer = this.knowledgeStory.peer[index];
							if (peer.id === this.userId) {
								this.viewerApproved = true;
							}
						}
						for (let index = 0; (!this.viewerApproved && index < this.knowledgeStory.requests.length); index++) {
							const peer = this.knowledgeStory.requests[index];
							if (peer.id === this.userId) {
								this.requested = true;
							}
						}
					}
					this.setTags();
					this.loadingKnowledgeStory = false;
				}, err => {
					this.storyNotFound = true;
					this.loadingKnowledgeStory = false;
				});
		}
	}

	openCollection(collection: any) {
		this.router.navigateByUrl('/' + collection.type + '/' + collection.id);
	}

	public openInviteFriendsDialog() {
		const shareObject = this.knowledgeStory;
		shareObject.type = 'story';
		this.dialogsService.inviteFriends(shareObject);
	}

	shareDialog() {
		const name = (this.knowledgeStory) ? this.knowledgeStory.protagonist[0].profiles[0].first_name + ' ' + this.knowledgeStory.protagonist[0].profiles[0].last_name : 'Knowledge Story';
		this.dialogsService.shareCollection('story', this.knowledgeStoryId, name).subscribe();
	}

	deleteStory() {
		this._knowledgeStoryService.deleteStory(this.knowledgeStoryId).subscribe(res => {
			this.matSnackBar.open('Story deleted', 'Close', { duration: 3000 });
			this.router.navigate(['']);
		});
	}

	setVisibility(newVisibility: 'private' | 'public') {
		this._knowledgeStoryService.patchKnowledgeStoryRequest(this.knowledgeStoryId,
			{ visibility: newVisibility }
		).subscribe(res => {
			this.initializePage();
		});
	}

	requestToView() {
		this._knowledgeStoryService.requestPeers(this.knowledgeStoryId, this.userId).subscribe(res => {
			this.matSnackBar.open('Placed a request', 'Close', { duration: 3000 });
			this.initializePage();
		});
	}


	public openProfilePage(peerId) {
		this.router.navigate(['profile', peerId]);
	}


	removeViewer(viewerId: string) {
		this._knowledgeStoryService.removePeerRelation(viewerId, this.knowledgeStoryId).subscribe(res => {
			this.initializePage();
		});
	}

	addViewer() {
		const peers = [];
		this.dialogsService.addViewer()
			.subscribe(res => {
				console.log(res);
				if (res) {
					res.selectedPeers.forEach(peer => {
						peers.push(peer.id);
					});
					this._knowledgeStoryService.connectPeers(this.knowledgeStoryId, { targetIds: peers })
						.subscribe(peersConnected => {
							console.log('peers connected');
							this.initializePage();
						});
				}
			});
	}

	approveRequest(requesterId: string) {
		this._knowledgeStoryService.deleteRequest(this.knowledgeStoryId, requesterId).flatMap(res => {
			return this._knowledgeStoryService.connectPeer(this.knowledgeStoryId, requesterId);
		}).subscribe(res => {
			this.matSnackBar.open('Peer approved', 'Close', { duration: 3000 });
			this.initializePage();
		}, err => {
			this.matSnackBar.open('Error', 'Close', { duration: 3000 });
		});
	}

	removeRequest(requesterId: string) {
		this._knowledgeStoryService.deleteRequest(this.knowledgeStoryId, requesterId).subscribe(res => {
			this.matSnackBar.open('Request Deleted', 'Close', { duration: 3000 });
			this.initializePage();
		}, err => {
			this.matSnackBar.open('Error', 'Close', { duration: 3000 });
		});
	}
}
