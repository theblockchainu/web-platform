import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ProfileService } from '../../_services/profile/profile.service';
import { SelectPriceComponent } from '../dialogs/select-price/select-price.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TopicService } from '../../_services/topic/topic.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { SelectDurationComponentComponent } from '../dialogs/select-duration-component/select-duration-component.component';
import { CollectionService } from '../../_services/collection/collection.service';
import { SelectTopicsComponent } from '../dialogs/select-topics/select-topics.component';
import { Meta, Title } from '@angular/platform-browser';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { QuestionService } from '../../_services/question/question.service';
import { TitleCasePipe } from '@angular/common';
import { CommunityService } from '../../_services/community/community.service';
import { CommentService } from '../../_services/comment/comment.service';
import { AuthenticationService } from '../../_services/authentication/authentication.service';

@Component({
	selector: 'app-questions',
	templateUrl: './questions.component.html',
	styleUrls: ['./questions.component.scss'],
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
export class QuestionsComponent implements OnInit {

	public availableTopics: Array<any>;
	public topicsBackup: Array<any>;

	public userId;
	public questions: Array<any>;
	public questionsBackup: Array<any>;
	@ViewChild('topicButton') topicButton;
	@ViewChild('priceButton') priceButton;
	@ViewChild('durationButton') durationButton;

	public availableRange: Array<number>;
	public selectedRange: Array<number>;

	public availableDurationRange: Array<number>;
	public selectedDurationRange: Array<number>;

	public questionForm: FormGroup;
	public answerForm: FormGroup;
	public commentForm: FormGroup;
	public replyForm: FormGroup;
	public answeringToQuestionId;
	public commentingToQuestionId;
	public replyingToCommentId;
	public commentingToAnswerId;
	public busyQuestion: boolean;
	public busyAnswer: boolean;
	public busyComment: boolean;
	public busyReply: boolean;
	public loggedInUser;
	public loadingUser: boolean;
	public selectedTopics: Array<any>;
	public loading = false;
	public envVariable;
	private today = moment();
	public filterForm: FormGroup;
	public languageList: Array<any>;
	public levelList: Array<any>;
	public ratingList: Array<number>;
	public showArchived: boolean;
	public availableSubtypes: Array<string>;

	constructor(
		public _collectionService: CollectionService,
		public _profileService: ProfileService,
		private _cookieUtilsService: CookieUtilsService,
		private _topicService: TopicService,
		public dialog: MatDialog,
		public elRef: ElementRef,
		public _dialogsService: DialogsService,
		public _questionsService: QuestionService,
		public _communityService: CommunityService,
		private _fb: FormBuilder,
		private titlecasepipe: TitleCasePipe,
		private _commentService: CommentService,
		private _authService: AuthenticationService,
		private titleService: Title,
		private metaService: Meta,
		private router: Router,
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
	}
	ngOnInit() {
		this.busyQuestion = false;
		this.busyAnswer = false;
		this.busyComment = false;
		this.busyReply = false;
		this.loadingUser = true;
		this.getLoggedInUser();
		this.initializeForms();
		this.fetchData();
		this.initializeFilters();
		this.setTags();
	}

	private setTags() {
		this.titleService.setTitle('Questions');
		this.metaService.updateTag({
			property: 'og:title',
			content: 'Explore Questions'
		});
		this.metaService.updateTag({
			property: 'og:site_name',
			content: 'theblockchainu.com'
		});
		this.metaService.updateTag({
			property: 'og:image',
			content: 'https://theblockchainu.com/bu_logo_square.png'
		});
		this.metaService.updateTag({
			property: 'og:url',
			content: environment.clientUrl + this.router.url
		});
	}

	private getLoggedInUser() {
		if (this.userId && this.userId.length > 5) {
			this._profileService.getPeerData(this.userId, { 'include': ['profiles', 'reviewsAboutYou', 'ownedCollections', 'scholarships_joined'] }).subscribe(res => {
				this.loggedInUser = res;
				this.loadingUser = false;
				console.log(this.loggedInUser);
			});
		} else {
			this.loadingUser = false;
			this.loggedInUser = null;
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

	private initializeFilters() {
		this.filterForm = this._fb.group({
			language: [],
			location: [],
			difficultyLevel: [],
			rating: [],
			subtype: []
		});

		this.filterForm.valueChanges.subscribe(res => {
			this.fitlerResults();
		});
	}

	private fitlerResults() {
		this.questions = this.questionsBackup.filter((val) => {
			let languageBool = false;
			let locationBool = false;
			let priceBool = false;
			let durationBool = false;
			let levelBool = false;
			let ratingBool = false;
			let subtypeBool = false;

			if (this.filterForm.value.language && this.filterForm.value.language.length > 0) {
				for (let i = 0; (i < this.filterForm.value.language.length && !languageBool); i++) {
					const language = this.filterForm.value.language[i];
					if (val.language.includes(language) && !languageBool) {
						languageBool = true;
					}
				}
			} else {
				languageBool = true;
			}

			if (this.filterForm.value.location && this.filterForm.value.location.length > 0) {
				for (let i = 0; (i < this.filterForm.value.location.length && !locationBool); i++) {
					const location = this.filterForm.value.location[i];
					if (val.location === location) {
						locationBool = true;
					}
				}
			} else {
				locationBool = true;
			}

			if (this.filterForm.value.difficultyLevel && this.filterForm.value.difficultyLevel.length > 0) {
				for (let i = 0; (i < this.filterForm.value.difficultyLevel.length && !levelBool); i++) {
					const level = this.filterForm.value.difficultyLevel[i];
					if (val.difficultyLevel === level) {
						levelBool = true;
					}
				}
			} else {
				levelBool = true;
			}

			if (this.filterForm.value.subtype && this.filterForm.value.subtype.length > 0) {
				for (let i = 0; (i < this.filterForm.value.subtype.length && !subtypeBool); i++) {
					const subtype = this.filterForm.value.subtype[i];
					console.log(subtype);
					console.log(val.subCategory);

					if (val.subCategory === subtype) {
						subtypeBool = true;
					}
				}
			} else {
				subtypeBool = true;
			}


			if (this.filterForm.value.rating && this.filterForm.value.rating.length > 0) {
				for (let i = 0; (i < this.filterForm.value.rating.length && !ratingBool); i++) {
					const rating = this.filterForm.value.rating[i];
					console.log(val);
					if (val.rating === rating || (rating === 0)) {
						ratingBool = true;
					}
				}
			} else {
				ratingBool = true;
			}

			if (this.selectedRange) {
				priceBool = (val.price >= this.selectedRange[0] && val.price <= this.selectedRange[1]);
			} else {
				priceBool = true;
			}

			if (this.selectedDurationRange) {
				durationBool = (val.totalHours >= this.selectedDurationRange[0] && val.totalHours <= this.selectedDurationRange[1]);
			} else {
				durationBool = true;
			}

			return languageBool && locationBool && priceBool && durationBool && levelBool && ratingBool && subtypeBool;
		});
	}

	fetchData() {
		this.loading = true;
		this.fetchQuestions();
	}


	fetchQuestions() {
		this.loading = true;
		const query = {
			'include': [
				'views',
				{ 'communities': ['owners', 'participants', 'topics'] },
				{ 'peer': 'profiles' },
				{ 'answers': [{ 'peer': 'profiles' }, { 'upvotes': { 'peer': 'profiles' } }, { 'comments': [{ 'peer': 'profiles' }, { 'replies': { 'peer': 'profiles' } }, { 'upvotes': 'peer' }] }, { 'views': 'peer' }, { 'flags': 'peer' }] },
				{ 'comments': [{ 'peer': 'profiles' }, { 'replies': { 'peer': 'profiles' } }, { 'upvotes': 'peer' }] },
				{ 'upvotes': { 'peer': 'profiles' } },
				{ 'views': 'peer' },
				{ 'flags': 'peer' },
				{ 'followers': 'profiles' },
				'topics'
			],
			'order': 'createdAt desc',
			'limit': 15
		};

		this._questionsService.getQuestions(JSON.stringify(query)).subscribe(
			(response: any) => {
				this.questions = [];
				response.forEach(question => {
					const topics = [];
					if (question.communities && question.communities.length > 0) {
						question.communities[0].topics.forEach(topicObj => {
							topics.push(this.titlecasepipe.transform(topicObj.name));
						});
						if (topics.length > 0) {
							question.topics = topics;
						} else {
							topics.push('No topics selected');
							question.topics = topics;
						}
						question.community = question.communities[0];
						question.communityId = question.community.id;
						this.initializeUserType(question);
					} else {
						if (question.topics && question.topics.length > 0) {
							const topicsArray = [];
							question.topics.forEach(topicObj => {
								if (topicObj.name) {
									topicsArray.push(this.titlecasepipe.transform(topicObj.name));
								}
							});
							question.topics = topicsArray;
						}
					}
					this.questions.push(question);
					console.log(question);

				});
				this.questionsBackup = _.cloneDeep(this.questions);
				this.loading = false;
			}, (err) => {
				console.log(err);
				this.loading = false;
			}
		);
	}

	private initializeUserType(question) {
		delete question.userType;
		if (question.community) {
			if (question.community.owners) {
				for (const owner of question.community.owners) {
					if (owner.id === this.userId) {
						question.userType = 'owner';
						break;
					}
				}
			}
			if (!question.userType) {
				question.userType = 'public';
				for (const participant of question.community.participants) {
					if (participant.id === this.userId) {
						question.userType = 'participant';
						break;
					}
				}
			}
		}
	}


	public openTopicsDialog(): void {
		const dialogRef = this.dialog.open(SelectTopicsComponent, {
			width: '250px',
			height: '300px',
			data: this.availableTopics,
			panelClass: ['responsive-dialog', 'responsive-fixed-position'],
			disableClose: true,
			position: {
				top: this.topicButton._elementRef.nativeElement.getBoundingClientRect().top + 'px',
				left: this.topicButton._elementRef.nativeElement.getBoundingClientRect().left + 'px'
			}
		});

		dialogRef.afterClosed().subscribe((result: any) => {
			if (result) {
				this.availableTopics = result;
				this.fetchQuestions();
			}
		});
	}

	public openPriceDialog(): void {
		const dialogRef = this.dialog.open(SelectPriceComponent, {
			width: '200px',
			height: '190px',
			panelClass: ['responsive-dialog', 'responsive-fixed-position'],
			data: {
				availableRange: this.availableRange,
				selectedRange: this.selectedRange
			},
			disableClose: true,
			position: {
				top: this.priceButton._elementRef.nativeElement.getBoundingClientRect().top + 'px',
				left: this.priceButton._elementRef.nativeElement.getBoundingClientRect().left + 'px'
			}
		});

		dialogRef.afterClosed().subscribe((result: any) => {
			if (result) {
				this.selectedRange = result.selectedRange;
				this.fitlerResults();
			}
		});
	}

	public openDurationDialog(): void {
		const dialogRef = this.dialog.open(SelectDurationComponentComponent, {
			width: '200px',
			height: '190px',
			panelClass: ['responsive-dialog', 'responsive-fixed-position'],
			data: {
				availableRange: this.availableDurationRange,
				selectedRange: this.selectedDurationRange
			},
			disableClose: true,
			position: {
				top: this.durationButton._elementRef.nativeElement.getBoundingClientRect().top + 'px',
				left: this.durationButton._elementRef.nativeElement.getBoundingClientRect().left + 'px'
			}
		});
		dialogRef.afterClosed().subscribe((result: any) => {
			if (result) {
				this.selectedDurationRange = result.selectedRange;
				this.fitlerResults();
			}
		});
	}

	public filterClickedTopic(index) {
		this.availableTopics = _.cloneDeep(this.topicsBackup);
		this.availableTopics[index]['checked'] = true;
		this.fetchQuestions();
	}

	public resetTopics() {
		this.availableTopics = _.cloneDeep(this.topicsBackup);
		this.fetchQuestions();
	}

	public toggleArchive() {
		this.questions = [];
		this.loading = true;
		this.showArchived = !this.showArchived;
		this.fetchData();
	}

	/**
	 * delete question
	 */
	public deleteQuestion(question: any) {
		this._communityService.deleteQuestion(question.id).subscribe(
			response => {
				this.fetchData();
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
			this._dialogsService.openSignup('/question/' + question.id);
		}
	}

	public createAnswerForm(question: any) {
		if (this.userId && this.userId.length > 5 && question.userType !== 'public') {
			this.answeringToQuestionId = question.id;
			this.answerForm = this._fb.group({
				text: ''
			});
		} else {
			this._dialogsService.openSignup('/question/' + question.id);
		}
	}

	public createAnswerCommentForm(answer: any) {
		if (this.userId && this.userId.length > 5) {
			this.commentingToAnswerId = answer.id;
			this.commentForm = this._fb.group({
				description: '',
				isAnnouncement: false
			});
		} else {
			this._dialogsService.openSignup('/home/questions');
		}
	}

	public createQuestionCommentForm(question: any) {
		if (this.userId && this.userId.length > 5 && question.userType !== 'public') {
			this.commentingToQuestionId = question.id;
			this.commentForm = this._fb.group({
				description: '',
				isAnnouncement: false
			});
		} else {
			this._dialogsService.openSignup('/question/' + question.id);
		}
	}

	/**
	 * post answer
	 */
	public postAnswer(question: any) {
		if (this.userId && this.userId.length > 5 && question.userType !== 'public') {
			this.busyAnswer = true;
			this._questionsService.answerToQuestion(question.id, this.answerForm.value).subscribe(
				response => {
					this.busyAnswer = false;
					this.fetchData();
					delete this.answerForm;
				}, err => {
					this.busyAnswer = false;
					console.log(err);
				}
			);
		} else {
			this._dialogsService.openSignup('/question/' + question.id);
		}
	}

	/**
	 * accept answer
	 */
	public acceptAnswer(question: any, answer: any) {
		if (this.userId && this.userId.length > 5 && question.userType !== 'public') {
			if (!answer.accept) {
				this.busyAnswer = true;
				this._questionsService.acceptAnswerToQuestion(question.id, answer.id, this.loggedInUser.ethAddress).subscribe(
					response => {
						this._authService.isLoginSubject.next(true);
						this.busyAnswer = false;
						this.fetchData();
					}, err => {
						this.busyAnswer = false;
						console.log(err);
					}
				);
			}
		} else {
			this._dialogsService.openSignup('/question/' + question.id);
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
				this.fetchData();
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
				this.fetchData();
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
				this.fetchData();
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
			this._dialogsService.openSignup('/home/questions');
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
			this._dialogsService.openSignup('/home/questions');
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
			this._dialogsService.openSignup('/home/questions');
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
				this.fetchData();
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
				this.fetchData();
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
				this.fetchData();
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
			this._dialogsService.openSignup('/question/' + question.id);
		}
	}

	public askQuestion() {
		this._dialogsService.askQuestion().subscribe(res => {
			if (res) {
				this.fetchData();
			}
		});
	}

}
