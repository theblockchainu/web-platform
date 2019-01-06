import { Component, OnInit, Inject, OnDestroy, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentService } from '../../../_services/comment/comment.service';
import { CollectionService } from '../../../_services/collection/collection.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { SocketService } from '../../../_services/socket/socket.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ContentService } from '../../../_services/content/content.service';
import { MediaUploaderService } from '../../../_services/mediaUploader/media-uploader.service';

@Component({
	selector: 'app-content-video',
	templateUrl: './content-video.component.html',
	styleUrls: ['./content-video.component.scss']
})
export class ContentVideoComponent implements OnInit {

	@Input() data: any;


	public userType = 'public';
	public experienceId = '';
	public chatForm: FormGroup;
	public replyForm: FormGroup;
	public replyingToCommentId: string;
	public comments: Array<any>;
	public userId;
	public startedView;
	// api: VgAPI;
	public attachmentUrls = [];
	public duration = 0;
	public envVariable;
	videoDownloadUrl: string;
	constructor(
		public _collectionService: CollectionService,
		private _fb: FormBuilder,
		private _commentService: CommentService,
		private cookieUtilsService: CookieUtilsService,
		private _socketService: SocketService,
		private router: Router,
		// private deviceService: DeviceDetectorService,
		private contentService: ContentService,
		private mediaUploaderService: MediaUploaderService
	) {
	}

	ngOnInit() {
		this.envVariable = environment;
		this.userId = this.cookieUtilsService.getValue('userId');
		this.userType = this.data.userType;
		this.experienceId = this.data.collectionId;
		this.data.content.supplementUrls.forEach(file => {
			this.contentService.getMediaObject(file).subscribe((res: any) => {
				this.attachmentUrls.push(res[0]);
			});
		});
		this.duration = Math.round(this.data.content.videoLength / 60);
		this.initializeForms();
		this.getDiscussions();
		this.getVideoUrl();
		this.duration = Math.round(this.data.content.videoLength / 60);
	}

	private initializeForms() {
		this.chatForm = this._fb.group({
			description: ['', Validators.required]
		});
	}

	/**
	 * postComment
	 */
	public postComment() {
		this._collectionService.postContentComments(this.data.content.id, this.chatForm.value, (err, response) => {
			if (err) {
				console.log(err);
			} else {
				this.chatForm.reset();
				this.getDiscussions();
			}
		});
	}

	public createReplyForm(comment: any) {
		this.replyingToCommentId = comment.id;
		this.replyForm = this._fb.group({
			description: ''
		});
	}

	/**
	 * postReply
	 */
	public postReply(comment: any) {
		this._commentService.replyToComment(comment.id, this.replyForm.value).subscribe(
			response => {
				this.getDiscussions();
				delete this.replyForm;
			}, err => {
				console.log(err);
			}
		);
	}

	private getDiscussions() {
		const query = {
			'include': [
				{
					'peer': [
						{ 'profiles': ['work'] }
					]
				},
				{
					'replies': [
						{
							'peer': [
								{
									'profiles': ['work']
								}
							]
						},
						{
							'upvotes': 'peer'
						}
					]
				},
				{
					'upvotes': 'peer'
				}
			],
			'order': 'createdAt DESC'
		};
		this._collectionService.getContentComments(this.data.content.id, query, (err, response) => {
			if (err) {
				console.log(err);
			} else {
				this.comments = response;
			}
		});
	}

	addCommentUpvote(comment: any) {
		this._commentService.addCommentUpvote(comment.id, {}).subscribe(
			response => {
				if (comment.upvotes !== undefined) {
					comment.upvotes.push(response);
				} else {
					comment.upvotes = [];
					comment.upvotes.push(response);
				}
			}, err => {
				console.log(err);
			}
		);
	}

	addReplyUpvote(reply: any) {
		this._commentService.addReplyUpvote(reply.id, {}).subscribe(
			response => {
				if (reply.upvotes !== undefined) {
					reply.upvotes.push(response);
				} else {
					reply.upvotes = [];
					reply.upvotes.push(response);
				}
			}, err => {
				console.log(err);
			}
		);
	}

	public hasUpvoted(upvotes) {
		let result = false;
		if (upvotes !== undefined) {
			upvotes.forEach(upvote => {
				if (upvote.peer !== undefined) {
					if (upvote.peer[0].id === this.userId) {
						result = true;
					}
				} else {
					result = true;
				}
			});
		}
		return result;
	}

	public isMyComment(comment) {
		return comment.peer[0].id === this.userId;
	}

	// public onPlayerReady(api: VgAPI) {
	// 	this.api = api;

	// 	this.api.getDefaultMedia().subscriptions.canPlay.subscribe(() => {
	// 		this.duration = Math.round(this.api.duration / 60);
	// 	});

	// 	this.api.getDefaultMedia().subscriptions.playing.subscribe(() => {
	// 		const view = {
	// 			type: 'user',
	// 			url: this.router.url,
	// 			ip_address: '',
	// 			browser: '', // this.deviceService.getDeviceInfo().browser,
	// 			viewedModelName: 'content',
	// 			startTime: new Date(),
	// 			content: this.data.content,
	// 			viewer: {
	// 				id: this.userId
	// 			}
	// 		};
	// 		this._socketService.sendStartView(view);
	// 		this._socketService.listenForViewStarted().subscribe(startedView => {
	// 			this.startedView = startedView;
	// 			console.log(startedView);
	// 		});
	// 	});

	// 	this.api.getDefaultMedia().subscriptions.pause.subscribe(() => {
	// 		this.startedView.viewer = {
	// 			id: this.userId
	// 		};
	// 		this.startedView.endTime = new Date();
	// 		this._socketService.sendEndView(this.startedView);
	// 		this._socketService.listenForViewEnded().subscribe(endedView => {
	// 			delete this.startedView;
	// 			console.log(endedView);
	// 		});
	// 	});
	// }

	public openProfilePage(peerId) {
		this.router.navigate(['profile', peerId]);
	}

	private getVideoUrl() {
		const urlArray = this.data.content.imageUrl.split('/');
		const filename = urlArray[urlArray.length - 1];
		this.mediaUploaderService.getDownloadUrl(filename).subscribe((res: any) => {
			this.videoDownloadUrl = res;
		}, err => {
			console.log(err);
		});
	}

}
