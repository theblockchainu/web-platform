import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { QuestionService } from '../../_services/question/question.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../_services/profile/profile.service';
import { CommentService } from '../../_services/comment/comment.service';
import { MatSnackBar } from '@angular/material';
import { CollectionService } from '../../_services/collection/collection.service';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { CommunityService } from '../../_services/community/community.service';
@Component({
	selector: 'app-question-page',
	templateUrl: './question-page.component.html',
	styleUrls: ['./question-page.component.scss']
})
export class QuestionPageComponent implements OnInit {
	public activeTab;
	public userId;
	public questionForm: FormGroup;
	public answerForm: FormGroup;
	public commentForm: FormGroup;
	public replyForm: FormGroup;
	public question: any;
	public loggedInUser;
	public loadingUser: boolean;
	public answeringToQuestionId;
	public commentingToQuestionId;
	public replyingToCommentId;
	public commentingToAnswerId;
	public questionsFilter: string;
	public busyQuestion: boolean;
	public busyAnswer: boolean;
	public busyComment: boolean;
	public busyReply: boolean;
	public userType: string;
	public gyanBalance: number;
	public questionHasQuestionMark: boolean;
	public questionKarmaBurn: number;
	public questionId: string;
	public community: any;
	private communityId: string;
	public loadingQuestion: boolean;
	private pageInitialized: boolean;
	
	constructor(
		private activatedRoute: ActivatedRoute,
		public _cookieUtilsService: CookieUtilsService,
		public _questionsService: QuestionService,
		public _collectionService: CollectionService,
		private _authService: AuthenticationService,
		public _commentService: CommentService,
		public _dialogsService: DialogsService,
		public _fb: FormBuilder,
		public snackBar: MatSnackBar,
		public _profileService: ProfileService,
		private router: Router,
		private _communityService: CommunityService) {
	}
	
	ngOnInit() {
		this.activatedRoute.params.subscribe(params => {
			const paramQuestionId = params['questionId'];
			if (this.questionId !== paramQuestionId) {
				this.questionId = paramQuestionId;
				this.initPage();
			}
		});
	}
	
	private initPage() {
		this.userId = this._cookieUtilsService.getValue('userId');
		this.loadingUser = true;
		this.questionsFilter = 'descending';
		this.busyQuestion = false;
		this.busyAnswer = false;
		this.busyComment = false;
		this.busyReply = false;
		this.userType = 'public';
		this.questionHasQuestionMark = false;
		this.loadingQuestion = true;
		this.pageInitialized = false;
		this.getLoggedInUser();
		this.getQuestion();
		this.initializeForms();
		this.getGyanBalance();
		this.questionForm.controls.text.valueChanges.subscribe(value => {
			if (value) {
				if (value.substring(value.length - 1) !== '?' && value.substring(value.length - 2, value.length - 1) !== '?' && !this.questionHasQuestionMark) {
					this.questionHasQuestionMark = true;
					this.questionForm.controls.text.setValue(value + '?');
				} else if (value.substring(value.length - 1) !== '?' && value.substring(value.length - 2, value.length - 1) !== '?' && this.questionHasQuestionMark) {
					this.questionForm.controls.text.setValue(value.substring(0, value.length - 1) + '?');
				} else if (value.substring(value.length - 1) !== '?' && value.substring(value.length - 2, value.length - 1) === '?') {
					this.questionForm.controls.text.setValue(value.substring(0, value.length - 2) + value.substring(value.length - 1) + '?');
				}
			}
		});
		this.questionForm.controls.gyan.valueChanges.subscribe(value => {
			if (value) {
				this._collectionService.getKarmaToBurn(value).subscribe(res => {
					this.questionKarmaBurn = res['karma'];
				});
			}
		});
		this._authService.isLoginSubject.subscribe(res => {
			if (this.pageInitialized) {
				console.log('Re Initializing Page');
				this.initPage();
			}
		});
		this.pageInitialized = true;
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
	
	public getGyanBalance() {
		if (this.userId && this.userId.length > 5) {
			this._profileService.getGyanBalance(this.userId, 'fixed').subscribe((res: any) => {
				if (res) {
					this.gyanBalance = parseInt(res, 10);
					
					if (this.gyanBalance === 0) {
						this.questionForm.controls['gyan'].disable();
					}
				} else {
					this.gyanBalance = 0;
					this.questionForm.controls['gyan'].disable();
				}
			}, (err) => {
				console.log(err);
				this.gyanBalance = 0;
				this.questionForm.controls['gyan'].disable();
			});
		} else {
			this.gyanBalance = 0;
			this.questionForm.controls['gyan'].disable();
		}
	}
	
	public getQuestion() {
		this.loadingQuestion = true;
		const query = {
			'include': [
				'views',
				{ 'communities': ['owners', 'participants'] },
				{ 'peer': 'profiles' },
				{ 'answers': [{ 'peer': 'profiles' }, { 'upvotes': { 'peer': 'profiles' } }, { 'comments': [{ 'peer': 'profiles' }, { 'replies': { 'peer': 'profiles' } }, { 'upvotes': 'peer' }] }, { 'views': 'peer' }, { 'flags': 'peer' }] },
				{ 'comments': [{ 'peer': 'profiles' }, { 'replies': { 'peer': 'profiles' } }, { 'upvotes': 'peer' }] },
				{ 'upvotes': { 'peer': 'profiles' } },
				{ 'views': 'peer' },
				{ 'flags': 'peer' },
				{ 'followers': 'profiles' }
			],
			'order': 'createdAt desc',
			'limit': 10
		};
		
		if (this.questionId) {
			this._questionsService.getQuestion(this.questionId, JSON.stringify(query)).subscribe((res: any) => {
				console.log(res);
				
				this.question = res;
				if (res.communities && res.communities.length > 0) {
					this.community = res.communities[0];
					this.communityId = this.community.id;
				}
				this.loadingQuestion = false;
				this.initializeUserType();
			}, err => {
				this.router.navigate(['error']);
			});
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
	
	private getLoggedInUser() {
		this._profileService.getPeerData(this.userId, { 'include': ['profiles', 'reviewsAboutYou', 'ownedCollections', 'scholarships_joined'] }).subscribe(res => {
			this.loggedInUser = res;
			this.loadingUser = false;
			console.log(this.loggedInUser);
		});
	}
	
	/**
	 * delete question
	 */
	public deleteQuestion(question: any) {
		this._communityService.deleteQuestion(question.id).subscribe(
			response => {
				this.getQuestion();
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
			this._dialogsService.openSignup('/question/' + this.questionId);
		}
	}
	
	public createAnswerForm(question: any) {
		if (this.userId && this.userId.length > 5 && this.userType !== 'public') {
			this.answeringToQuestionId = question.id;
			this.answerForm = this._fb.group({
				text: ''
			});
		} else {
			this._dialogsService.openSignup('/question/' + this.questionId);
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
			this._dialogsService.openSignup('/question/' + this.questionId);
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
			this._dialogsService.openSignup('/question/' + this.questionId);
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
					this.getQuestion();
					delete this.answerForm;
				}, err => {
					this.busyAnswer = false;
					console.log(err);
				}
			);
		} else {
			this._dialogsService.openSignup('/question/' + this.questionId);
		}
	}
	
	/**
	 * accept answer
	 */
	public acceptAnswer(question: any, answer: any) {
		if (!answer.accept) {
			this.busyAnswer = true;
			this._questionsService.acceptAnswerToQuestion(question.id, answer.id, this.loggedInUser.ethAddress).subscribe(
				response => {
					this._authService.isLoginSubject.next(true);
					this.busyAnswer = false;
					this.getQuestion();
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
				this.getQuestion();
				delete this.commentForm;
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
				this.getQuestion();
				delete this.commentForm;
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
				this.getQuestion();
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
			this._dialogsService.openSignup('/question/' + this.questionId);
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
		if (question.peer && question.peer.length > 0) {
			return question.peer[0].id === this.userId;
		} else {
			return false;
		}
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
			this._dialogsService.openSignup('/question/' + this.questionId);
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
			this._dialogsService.openSignup('/question/' + this.questionId);
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
				this.getQuestion();
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
				this.getQuestion();
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
				this.getQuestion();
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
						question.followers.push(this.loggedInUser);
					} else {
						question.followers = [];
						question.followers.push(this.loggedInUser);
					}
				});
			}
		} else {
			this._dialogsService.openSignup('/question/' + this.questionId);
		}
	}
	
}
