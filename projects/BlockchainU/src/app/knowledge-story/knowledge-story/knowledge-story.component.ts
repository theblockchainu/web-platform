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
import { ProfileService } from '../../_services/profile/profile.service';
import { CertificateService } from '../../_services/certificate/certificate.service';
import { flatMap } from 'rxjs/operators';
@Component({
	selector: 'app-knowledge-story',
	templateUrl: './knowledge-story.component.html',
	styleUrls: ['./knowledge-story.component.scss']
})
export class KnowledgeStoryComponent implements OnInit {
	public loadingKnowledgeStory: boolean;
	public loadingBlockTransactions = true;
	public loadingCertificates = true;
	public blockTransactions: any;
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
	public globalStory = false;
	public certificates: any;
	public isBrowser: boolean;
	constructor(
		private activatedRoute: ActivatedRoute,
		private _cookieUtilsService: CookieUtilsService,
		private _knowledgeStoryService: KnowledgeStoryService,
		public _collectionService: CollectionService,
		private router: Router,
		private titleService: Title,
		private metaService: Meta,
		public dialogsService: DialogsService,
		private _profileService: ProfileService,
		private matSnackBar: MatSnackBar,
		public authService: AuthenticationService,
		private _certificateService: CertificateService
	) {
		this.envVariable = environment;
		this.isBrowser = this._cookieUtilsService.isBrowser;
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
			property: 'og:site_name',
			content: 'theblockchainu.com'
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
		if (this.knowledgeStoryId && this.knowledgeStoryId !== 'me') {
			this._knowledgeStoryService.fetchKnowledgeStory(this.knowledgeStoryId, filter)
				.subscribe((res: any) => {
					this.knowledgeStory = res;
					console.log(this.knowledgeStory);
					this.fetchBlockTransactions(this.knowledgeStory.topics.map(topic => topic.name));
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
		} else if (this.knowledgeStoryId && this.knowledgeStoryId === 'me') {
			this.ownerView = true;
			this.viewerApproved = true;
			this.globalStory = true;
			this.fetchPeerProfile();
		} else {
			this.storyNotFound = true;
		}
	}

	private fetchPeerProfile() {
		const filter = {
			'include': [
				{ 'profiles': ['work', 'education'] }
			]
		};
		this._profileService.getPeerData(this.userId, filter).subscribe(res => {
			this.knowledgeStory = {
				'protagonist': []
			};
			this.knowledgeStory.protagonist.push(res);
			this.setTags();
			this.fetchBlockTransactions({});
			this.fetchCertificates({});
			this.loadingKnowledgeStory = false;
		});
	}

	private fetchBlockTransactions(topics) {
		this.loadingBlockTransactions = true;
		this._knowledgeStoryService.fetchBlockTransactions(this.knowledgeStory.protagonist[0].ethAddress, topics)
			.subscribe(
				res => {
					if (res) {
						this.blockTransactions = res;
					} else {
						this.blockTransactions = [];
					}
					this.loadingBlockTransactions = false;
				},
				err => {
					this.loadingBlockTransactions = false;
					this.blockTransactions = [];
				}
			);
	}

	private fetchCertificates(topics) {
		this.loadingCertificates = true;
		this._certificateService.getCertificates(this.userId)
			.subscribe(
				res => {
					if (res) {
						this.certificates = res;
					} else {
						this.certificates = [];
					}
					this.loadingCertificates = false;
				},
				err => {
					this.loadingCertificates = false;
					this.certificates = [];
				}
			);
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
		this.dialogsService.shareCollection('story', this.knowledgeStoryId, name, 'Verified on one0x Blockchain', '', this.envVariable.apiUrl + this.knowledgeStory.protagonist[0].profiles[0].picture_url).subscribe();
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
		this._knowledgeStoryService.deleteRequest(this.knowledgeStoryId, requesterId).pipe(
			flatMap(res => {
				return this._knowledgeStoryService.connectPeer(this.knowledgeStoryId, requesterId);
			})
		).subscribe(res => {
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

	public parseTransactionLog(result) {
		const parsedLog = {
			events: [],
			hash: '',
			args: {},
			timestamp: ''
		};
		const resultObject = JSON.parse(result);
		if (resultObject.hasOwnProperty('logs')) {
			resultObject.logs.forEach(log => {
				parsedLog.events.push(log.event);
				parsedLog.hash = log.transactionHash;
				parsedLog.args = log.args;
			});
		}
		return parsedLog;
	}

	public parseCertificate(certificate) {
		return JSON.parse(certificate);
	}

	public openCertificate(certId) {
		this.router.navigate(['certificate', certId]);
	}
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
