import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunityPageComponent } from '../community-page.component';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { QuestionService } from '../../../_services/question/question.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommunityService } from '../../../_services/community/community.service';
import { ProfileService } from '../../../_services/profile/profile.service';
import { CommentService } from '../../../_services/comment/comment.service';
import { MatSnackBar } from '@angular/material';
import { CollectionService } from '../../../_services/collection/collection.service';
import { AuthenticationService } from '../../../_services/authentication/authentication.service';
import {DialogsService} from "../../../_services/dialogs/dialog.service";

@Component({
    selector: 'app-community-page-questions',
    templateUrl: './community-page-questions.component.html',
    styleUrls: ['./community-page-questions.component.scss', '../community-page.component.scss']
})
export class CommunityPageQuestionsComponent implements OnInit {

    public activeTab;
    public communityId;
    public userId;
    public questionForm: FormGroup;
    public answerForm: FormGroup;
    public commentForm: FormGroup;
    public replyForm: FormGroup;
    public loadingQuestions = false;
    public questions: any;
    public loggedInUser;
    public loadingUser = true;
    public answeringToQuestionId;
    public commentingToQuestionId;
    public replyingToCommentId;
    public commentingToAnswerId;
    public questionsFilter = 'descending';
    public busyQuestion = false;
    public busyAnswer = false;
    public busyComment = false;
    public busyReply = false;
    public userType = 'public';
    public gyanBalance: number;
    public questionHasQuestionMark = false;
    public questionKarmaBurn: number;

    constructor(activatedRoute: ActivatedRoute,
        public communityPageComponent: CommunityPageComponent,
        public _cookieUtilsService: CookieUtilsService,
        public _questionsService: QuestionService,
        public _communityService: CommunityService,
        public _collectionService: CollectionService,
        private _authService: AuthenticationService,
        public _commentService: CommentService,
        public _dialogsService: DialogsService,
        public _fb: FormBuilder,
        public snackBar: MatSnackBar,
        public _profileService: ProfileService) {

        activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
            console.log('activated route is: ' + JSON.stringify(urlSegment));
            if (urlSegment[0] === undefined) {
                this.communityId = '';
            } else {
                this.communityId = urlSegment[0].path;
            }
        });

        activatedRoute.pathFromRoot[5].url.subscribe((urlSegment) => {
            console.log('activated route is: ' + JSON.stringify(urlSegment));
            if (urlSegment[0] === undefined) {
                _communityService.setActiveTab('questions');
            } else {
                _communityService.setActiveTab(urlSegment[0].path);
            }
        });
        this.userId = _cookieUtilsService.getValue('userId');
    }

    ngOnInit() {
        this.getLoggedInUser();
        this.getQuestions();
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
    }

    public getGyanBalance() {
        this._profileService.getGyanBalance(this.userId, 'fixed').subscribe((res: any) => {
            this.gyanBalance = parseInt(res, 10);

            if (this.gyanBalance === 0) {
                this.questionForm.controls['gyan'].disable();
            }
        });
    }

    public getQuestions() {
        this.loadingQuestions = true;
        const query = {
            'include': [
                'views',
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

        if (this.communityId) {
            this._communityService.getQuestions(this.communityId, query, (err, response) => {
                if (err) {
                    console.log(err);
                } else {
                    this.questions = response;
                    this.loadingQuestions = false;
                }
            });
        } else {
            console.log('NO COMMUNITY');
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
            this.userType = this.communityPageComponent.getUserType();
        });
    }

    /**
     * post question
     */
    public postQuestion() {
    	if (this.userId && this.userId.length > 5 && this.userType !== 'public') {
			if (this.questionForm.valid && (this.questionForm.controls['gyan'].value <= this.gyanBalance || this.questionForm.controls['gyan'].disabled)) {
				// If user has a scholarship, make sure the scholarship is used for karma burn.
				if (this.loggedInUser.scholarships_joined && this.loggedInUser.scholarships_joined.length > 0) {
					this.questionForm.controls['scholarshipId'].patchValue(this.loggedInUser.scholarships_joined[0].id);
				}
				// If gyan balance is 0, make the gyan amount 1.
				if (this.gyanBalance === 0) {
					this.questionForm.controls['gyan'].patchValue(1);
					this.questionForm.value['gyan'] = 1;
				}
				this.busyQuestion = true;
				this._communityService.postQuestion(this.communityId, this.questionForm.value).subscribe((result: any) => {
						this._authService.isLoginSubject.next(true);
						this.questionForm.reset();
						this.busyQuestion = false;
						this.getQuestions();
					},
					err => {
						console.log(err);
					});
			} else {
				this.snackBar.open('Check if you have enough gyan balance in your account for this question.', 'Ok', { duration: 5000 });
			}
		} else if (this.userId && this.userId.length > 5 && this.userType === 'public') {
    		this.snackBar.open('Please join this community before posting any questions.', 'Join Now', {duration: 5000})
				.onAction().subscribe(res => {
				
			});
		} else {
    		this._dialogsService.openSignup('/community/' + this.communityId + '/questions');
		}
    }

    /**
     * delete question
     */
    public deleteQuestion(question: any) {
        this._communityService.deleteQuestion(question.id).subscribe(
            response => {
                this.getQuestions();
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
			this._dialogsService.openSignup('/community/' + this.communityId + '/questions');
		}
    }

    public createAnswerForm(question: any) {
    	if (this.userId && this.userId.length > 5 && this.userType !== 'public') {
			this.answeringToQuestionId = question.id;
			this.answerForm = this._fb.group({
				text: ''
			});
		} else {
    		this._dialogsService.openSignup('/community/' + this.communityId + '/questions');
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
			this._dialogsService.openSignup('/community/' + this.communityId + '/questions');
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
			this._dialogsService.openSignup('/community/' + this.communityId + '/questions');
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
					this.getQuestions();
					delete this.answerForm;
				}, err => {
					this.busyAnswer = false;
					console.log(err);
				}
			);
		} else {
			this._dialogsService.openSignup('/community/' + this.communityId + '/questions');
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
                    this.getQuestions();
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
                this.getQuestions();
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
                this.getQuestions();
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
                this.getQuestions();
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
			this._dialogsService.openSignup('/community/' + this.communityId + '/questions');
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
			this._dialogsService.openSignup('/community/' + this.communityId + '/questions');
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
			this._dialogsService.openSignup('/community/' + this.communityId + '/questions');
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
                this.getQuestions();
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
                this.getQuestions();
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
                this.getQuestions();
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
			this._dialogsService.openSignup('/community/' + this.communityId + '/questions');
		}
    }

}
