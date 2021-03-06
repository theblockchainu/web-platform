import { Component, OnInit, Inject, Input, OnChanges } from '@angular/core';
import { CollectionService } from '../../../_services/collection/collection.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommentService } from '../../../_services/comment/comment.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { ContentService } from '../../../_services/content/content.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DialogsService } from '../../../_services/dialogs/dialog.service';

@Component({
	selector: 'app-content-inperson',
	templateUrl: './content-inperson.component.html',
	styleUrls: ['./content-inperson.component.scss']
})
export class ContentInpersonComponent implements OnInit {

	@Input() data: any;

	public userType = 'public';
	public collectionId = '';
	public chatForm: FormGroup;
	public replyForm: FormGroup;
	public replyingToCommentId: string;
	public comments: Array<any>;
	public userId;
	public attachmentUrls = [];
	public duration = 0;
	public lat;
	public lng;
	public envVariable;

	constructor(
		public _collectionService: CollectionService,
		private _fb: FormBuilder,
		private _commentService: CommentService,
		private _cookieUtilsService: CookieUtilsService,
		private contentService: ContentService,
		private _dialogsService: DialogsService,
		private router: Router,
	) {
	}

	ngOnInit() {
		this.setUpContent();
	}

	private setUpContent() {
		console.log('in person data changed');
		this.envVariable = environment;
		this.userType = this.data.userType;
		this.collectionId = this.data.collectionId;
		this.userId = this._cookieUtilsService.getValue('userId');
		this.data.content.supplementUrls.forEach(file => {
			this.contentService.getMediaObject(file).subscribe((res: any) => {
				this.attachmentUrls.push(res[0]);
			});
		});
		const startMoment = moment(this.data.content.schedules[0].startTime);
		const endMoment = moment(this.data.content.schedules[0].endTime);
		const contentLength = moment.utc(endMoment.diff(startMoment)).format('HH');
		this.duration = parseInt(contentLength, 10);
		if (this.data.content.locations && this.data.content.locations.length > 0) {
			this.lat = parseFloat(this.data.content.locations[0].map_lat);
			this.lng = parseFloat(this.data.content.locations[0].map_lng);
		}
		this.getDiscussions();
		this.initializeForms();
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

	public openProfilePage(peerId) {
		this.router.navigate(['profile', peerId]);
	}

	rsvpContent(contentId) {
		this.contentService.createRSVP(contentId, this.data.calendarId)
			.subscribe((response: any) => {
				console.log(response);
				this.data.content.hasRSVPd = true;
			});
	}

	cancelRSVP(content) {
		console.log(content);
		this.contentService.deleteRSVP(content.rsvpId)
			.subscribe((response: any) => {
				console.log(response);
				this.data.content.hasRSVPd = false;
			});
	}

	public viewRSVPs(content, userType) {
		let attendies = this.data.participants;
		if (content.rsvps) {
			content.rsvps.forEach(rsvp => {
				if (rsvp.peer) {
					const peer = rsvp.peer[0];
					const peerFound = _.find(attendies, function (o) { return o.id === peer.id; });
					if (peerFound) {
						peerFound.hasRSVPd = true;
						peerFound.rsvpId = rsvp.id;
						peerFound.isPresent = rsvp.isPresent;
						return;
					}
				}
			});
		}
		attendies = _.filter(attendies, function (o) { return o.hasRSVPd; });
		this._dialogsService.showRSVP(userType, content, attendies, this.collectionId)
			.subscribe((result: any) => {});
	}

	public getDirections(content) {
		// TODO: get directions to this content location
	}

	public hasDatePassed(date) {
		const eventDate = moment(date);
		const currentDate = moment();
		return (this.data.calendarId !== undefined && eventDate.diff(currentDate, 'seconds') < 0);
	}

	/**
	 * isLive
	 */
	public isLive(content: any) {
		const startMoment = moment(this.data.calendarId.startDate);
		startMoment.add(content.schedules[0].startDay, 'day');
		const endMoment = startMoment.clone();
		endMoment.add(content.schedules[0].endDay, 'day');
		const currentMoment = moment();

		const startTime = moment(content.schedules[0].startTime);
		const endTime = moment(content.schedules[0].endTime);

		startMoment.hours(startTime.hours());
		startMoment.minutes(startTime.minutes());

		endMoment.hours(endTime.hours());
		endMoment.minutes(endTime.minutes());

		if (currentMoment.isBetween(startMoment, endMoment)) {
			content.isLive = true;
			return true;
		} else {
			return false;
		}
	}

}
