import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DialogsService} from '../../_services/dialogs/dialog.service';
import {CookieUtilsService} from '../../_services/cookieUtils/cookie-utils.service';
import {environment} from '../../../environments/environment';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProfileService} from '../../_services/profile/profile.service';
import {MatSnackBar} from '@angular/material';
import {CommentService} from '../../_services/comment/comment.service';
import {QuestionService} from '../../_services/question/question.service';
import {CommunityService} from '../../_services/community/community.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-question-card',
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.scss']
})
export class QuestionCardComponent implements OnInit {
	
	public envVariable;
	public userId;
	public questionForm: FormGroup;
	public answerForm: FormGroup;
	public commentForm: FormGroup;
	public replyForm: FormGroup;
	public answeringToQuestionId;
	public commentingToQuestionId;
	public replyingToCommentId;
	public commentingToAnswerId;
	public busyAnswer: boolean;
	public busyComment: boolean;
	public busyReply: boolean;
	public userType: string;
	public gyanBalance: number;
	public community: any;
	private communityId: string;
	
	@Input() question: any;
	@Input() cardsPerRow = 3;
	@Output() refresh = new EventEmitter<any>();
	
	constructor(
		private _cookieUtilsService: CookieUtilsService,
		public _dialogsService: DialogsService,
		public _commentService: CommentService,
		public _fb: FormBuilder,
		public snackBar: MatSnackBar,
		public _profileService: ProfileService,
		public _questionsService: QuestionService,
		public _communityService: CommunityService,
		public router: Router
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}
	
	ngOnInit() {
		this.community = this.question.communities[0];
		this.communityId = this.community.id;
		this.initializeUserType();
		this.initializeForms();
	}
	
	private initializeUserType() {
		delete this.userType;
		if (this.community) {
			if (this.community.owners) {
				for (const owner of this.community.owners) {
					if (owner.id === this.userId) {
						this.userType = 'owner';
						break;
					}
				}
			}
			if (!this.userType) {
				this.userType = 'public';
				for (const participant of this.community.participants) {
					if (participant.id === this.userId) {
						this.userType = 'participant';
						break;
					}
				}
			}
		}
	}
	
	private initializeForms() {
		this.questionForm = this._fb.group({
			text: ['', Validators.required],
			gyan: ['1', [Validators.required, Validators.min(1)]],
			scholarshipId: ['NA']
		});
		this.answerForm = this._fb.group({
			text: ['', [Validators.required, Validators.minLength(50)]]
		});
		this.commentForm = this._fb.group({
			description: ['', Validators.required]
		});
		this.replyForm = this._fb.group({
			description: ['', Validators.required]
		});
	}
	
	/**
	 * delete question
	 */
	public deleteQuestion(question: any) {
		this._communityService.deleteQuestion(question.id).subscribe(
			response => {
				this.refresh.emit(true);
			}, err => {
				console.log(err);
			}
		);
	}
	
	public addQuestionUpvote(question: any) {
		if (this.userId && this.userId.length > 5) {
			this._questionsService.addQuestionUpvote(question.id, {}).subscribe(
				response => {
					if (question.upvotes !== undefined) {
						question.upvotes.push(response);
					} else {
						question.upvotes = [];
						question.upvotes.push(response);
					}
				}, err => {
					console.log(err);
				}
			);
		} else {
			this._dialogsService.openSignup('/question/' + this.question.id);
		}
	}
	
	public createAnswerForm(question: any) {
		if (this.userId && this.userId.length > 5 && this.userType !== 'public') {
			this.answeringToQuestionId = question.id;
			this.answerForm = this._fb.group({
				text: ''
			});
		} else {
			this._dialogsService.openSignup('/question/' + this.question.id);
		}
	}
	
	public createAnswerCommentForm(answer: any) {
		if (this.userId && this.userId.length > 5 && this.userType !== 'public') {
			this.commentingToAnswerId = answer.id;
			this.commentForm = this._fb.group({
				description: '',
				isAnnouncement: false
			});
		} else {
			this._dialogsService.openSignup('/question/' + this.question.id);
		}
	}
	
	public createQuestionCommentForm(question: any) {
		if (this.userId && this.userId.length > 5 && this.userType !== 'public') {
			this.commentingToQuestionId = question.id;
			this.commentForm = this._fb.group({
				description: '',
				isAnnouncement: false
			});
		} else {
			this._dialogsService.openSignup('/question/' + this.question.id);
		}
	}
	
	/**
	 * post answer
	 */
	public postAnswer(question: any) {
		if (this.userId && this.userId.length > 5 && this.userType !== 'public') {
			this.busyAnswer = true;
			this._questionsService.answerToQuestion(question.id, this.answerForm.value).subscribe(
				response => {
					this.busyAnswer = false;
					delete this.answerForm;
					this.refresh.emit(true);
				}, err => {
					this.busyAnswer = false;
					console.log(err);
				}
			);
		} else {
			this._dialogsService.openSignup('/question/' + this.question.id);
		}
	}
	
	/**
	 * accept answer
	 */
	public acceptAnswer(question: any, answer: any) {
		if (!answer.accept) {
			this.busyAnswer = true;
			this._questionsService.acceptAnswerToQuestion(question.id, answer.id, '').subscribe(
				response => {
					this.busyAnswer = false;
					this.refresh.emit(true);
				}, err => {
					this.busyAnswer = false;
					console.log(err);
				}
			);
		}
	}
	
	/**
	 * post comment to answer
	 */
	public postCommentToAnswer(answer: any) {
		this.busyComment = true;
		this._questionsService.postCommentToAnswer(answer.id, this.commentForm.value).subscribe(
			response => {
				this.busyComment = false;
				delete this.commentForm;
				this.refresh.emit(true);
			}, err => {
				this.busyComment = false;
				console.log(err);
			}
		);
	}
	
	/**
	 * post comment to question
	 */
	public postCommentToQuestion(question: any) {
		this.busyComment = true;
		this._questionsService.postCommentToQuestion(question.id, this.commentForm.value).subscribe(
			response => {
				this.busyComment = false;
				delete this.commentForm;
				this.refresh.emit(true);
			}, err => {
				this.busyComment = false;
				console.log(err);
			}
		);
	}
	
	/**
	 * delete answer
	 */
	public deleteAnswer(answer: any) {
		this._questionsService.deleteAnswer(answer.id).subscribe(
			response => {
				this.refresh.emit(true);
			}, err => {
				console.log(err);
			}
		);
	}
	
	/**
	 * add answer upvote
	 * @param answer
	 */
	addAnswerUpvote(answer: any) {
		if (this.userId && this.userId.length > 5) {
			this._questionsService.addAnswerUpvote(answer.id, {}).subscribe(
				response => {
					if (answer.upvotes !== undefined) {
						answer.upvotes.push(response);
					} else {
						answer.upvotes = [];
						answer.upvotes.push(response);
					}
				}, err => {
					console.log(err);
				}
			);
		} else {
			this._dialogsService.openSignup('/question/' + this.question.id);
		}
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
	
	public isFollowing(followers) {
		let result = false;
		if (followers !== undefined) {
			followers.forEach(follower => {
				if (follower.id === this.userId) {
					result = true;
				}
			});
		}
		return result;
	}
	
	public isMyQuestion(question) {
		return question.peer[0].id === this.userId;
	}
	
	public isMyAnswer(answer) {
		return answer.peer[0].id === this.userId;
	}
	
	public addCommentUpvote(comment: any) {
		if (this.userId && this.userId.length > 5) {
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
		} else {
			this._dialogsService.openSignup('/question/' + this.question.id);
		}
	}
	
	public addReplyUpvote(reply: any) {
		if (this.userId && this.userId.length > 5) {
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
		} else {
			this._dialogsService.openSignup('/question/' + this.question.id);
		}
	}
	
	public isMyComment(comment) {
		return comment.peer[0].id === this.userId;
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
		this.busyReply = true;
		this._commentService.replyToComment(comment.id, this.replyForm.value).subscribe(
			response => {
				this.busyReply = false;
				this.refresh.emit(true);
				delete this.replyForm;
			}, err => {
				this.busyReply = false;
				console.log(err);
			}
		);
	}
	
	/**
	 * deleteReply
	 */
	public deleteReply(reply: any) {
		this._commentService.deleteReply(reply.id).subscribe(
			response => {
				this.refresh.emit(true);
			}, err => {
				console.log(err);
			}
		);
	}
	
	/**
	 * deleteComment
	 */
	public deleteComment(comment: any) {
		this._commentService.deleteComment(comment.id).subscribe(
			response => {
				this.refresh.emit(true);
			}, err => {
				console.log(err);
			}
		);
	}
	
	public addFollower(question) {
		if (this.userId && this.userId.length > 5) {
			if (!this.isFollowing(question.followers)) {
				this._questionsService.addFollower(question.id, this.userId).subscribe(res => {
					if (question.followers !== undefined) {
						question.followers.push(res);
					} else {
						question.followers = [];
						question.followers.push(res);
					}
				});
			}
		} else {
			this._dialogsService.openSignup('/question/' + this.question.id);
		}
	}
	
	public openQuestionPage() {
		this.router.navigate(['question', this.question.id]);
	}

}
