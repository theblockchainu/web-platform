import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {CollectionService} from '../../../_services/collection/collection.service';
import {ContentService} from '../../../_services/content/content.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar, MatTable} from '@angular/material';
import {DialogsService} from '../../../_services/dialogs/dialog.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../../environments/environment';
import {CommentService} from '../../../_services/comment/comment.service';
import {CookieUtilsService} from '../../../_services/cookieUtils/cookie-utils.service';
import {Router} from '@angular/router';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-content-quiz',
  templateUrl: './content-quiz.component.html',
  styleUrls: ['./content-quiz.component.scss']
})
export class ContentQuizComponent implements OnInit {
	
	public userType = 'public';
	public classId = '';
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
	public questionArray;
	public answerArray;
	public hasAnswered = false;
	public totalRequiredQuestions = 0;
	public showSuccessMessage = false;
	public answeredDate;
	public loadingSubmissions = true;
	public savingData = false;
	public submissionArray = [];
	public displayedSubmissionTableColumns = ['peerName', 'questionsAnswered'];
	
	@ViewChild(MatTable) table: MatTable<any>;
	
	constructor(
		public _collectionService: CollectionService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<ContentQuizComponent>,
		private _fb: FormBuilder,
		private _commentService: CommentService,
		private _cookieUtilsService: CookieUtilsService,
		private dialogsService: DialogsService,
		private contentService: ContentService,
		private snackBar: MatSnackBar,
		private dialog: MatDialog,
		private router: Router
	) {
		this.envVariable = environment;
		this.userType = data.userType;
		this.classId = data.collectionId;
		this.userId = _cookieUtilsService.getValue('userId');
		data.content.supplementUrls.forEach(file => {
			this.contentService.getMediaObject(file).subscribe((res: any) => {
				this.attachmentUrls.push(res[0]);
			});
		});
		const startMoment = moment(data.content.schedules[0].startTime);
		const endMoment = moment(data.content.schedules[0].endTime);
		const contentLength = moment.utc(endMoment.diff(startMoment)).format('HH');
		this.duration = parseInt(contentLength, 10);
		if (data.content.locations && data.content.locations.length > 0) {
			this.lat = parseFloat(data.content.locations[0].map_lat);
			this.lng = parseFloat(data.content.locations[0].map_lng);
		}
	}
	
	ngOnInit() {
		this.showSuccessMessage = false;
		this.checkHasAnswered(this.data.content.questions, this.userId);
		this.initializeForms();
		this.processSubmissions();
		this.getDiscussions();
	}
	
	private processSubmissions() {
		this.loadingSubmissions = true;
		this.submissionArray = [];
		if (this.data.content.questions) {
			this.data.content.questions.forEach(question => {
				if (question.answers) {
					question.answers.forEach(answer => {
						if (answer.peer) {
							// If the answer is by a peer who already has an entry in this array
							if (_.find(this.submissionArray, function(o) { return o.peerId === answer.peer[0].id; })) {
								_.find(this.submissionArray, function(o) { return o.peerId === answer.peer[0].id; }).questionsAnswered++;
								if (question.type === 'single-choice') {
									if (answer.answer === question.correct_answer || parseInt(question.correct_answer, 10) === parseInt(answer.answer, 10)) {
										_.find(this.submissionArray, function (o) {
											return o.peerId === answer.peer[0].id;
										}).correctAnswers++;
									} else {
										_.find(this.submissionArray, function (o) {
											return o.peerId === answer.peer[0].id;
										}).wrongAnswers++;
									}
								} else {
									if (answer.isEvaluated && answer.marks === question.marks) {
										_.find(this.submissionArray, function (o) {
											return o.peerId === answer.peer[0].id;
										}).correctAnswers++;
									} else if (answer.isEvaluated && answer.marks === 0) {
										_.find(this.submissionArray, function (o) {
											return o.peerId === answer.peer[0].id;
										}).wrongAnswers++;
									} else {
										_.find(this.submissionArray, function (o) {
											return o.peerId === answer.peer[0].id;
										}).pendingEvaluation++;
									}
								}
							} else {
								let questions = _.clone(this.data.content.questions);
								this.checkHasAnswered(questions, answer.peer[0].id);
								questions = this.evaluateMyAnswers(questions);
								const submissionEntry = {
									position: this.submissionArray.length + 1,
									peerId: answer.peer[0].id,
									peerName: answer.peer[0].profiles[0].first_name + ' ' + answer.peer[0].profiles[0].last_name,
									questionsAnswered: 1,
									correctAnswers: 0,
									wrongAnswers: 0,
									pendingEvaluation: 0,
									answeredDate: this.getAnsweredDate(questions),
									questions: questions,
									peer: answer.peer[0]
								};
								if (question.type === 'single-choice') {
									if (answer.answer === question.correct_answer || parseInt(question.correct_answer, 10) === parseInt(answer.answer, 10)) {
										submissionEntry.correctAnswers++;
									} else {
										submissionEntry.wrongAnswers++;
									}
								} else {
									if (answer.isEvaluated && answer.marks === question.marks) {
										submissionEntry.correctAnswers++;
									} else if (answer.isEvaluated && answer.marks === 0) {
										submissionEntry.wrongAnswers++;
									} else {
										submissionEntry.pendingEvaluation++;
									}
								}
								this.submissionArray.push(submissionEntry);
							}
						}
					});
				}
			});
			console.log(this.submissionArray);
			this.loadingSubmissions = false;
		} else {
			this.loadingSubmissions = false;
		}
	}
	
	private checkHasAnswered(questions, userId) {
		if (questions) {
			questions.forEach(question => {
				if (question.answers) {
					question.answers.forEach(answer => {
						if (answer.peer && answer.peer[0].id === userId) {
							question.myAnswer = answer;
							if (userId === this.userId) {
								this.hasAnswered = true;
								this.answeredDate = moment(answer.createdAt).format('Do MMM YY');
							}
							return answer;
						}
					});
				}
			});
		}
		return false;
	}
	
	private evaluateMyAnswers(questions) {
		questions.forEach(question => {
			if (question.myAnswer) {
				if (question.type === 'single-choice') {
					if (question.myAnswer.answer === question.correct_answer || parseInt(question.correct_answer, 10) === parseInt(question.myAnswer.answer, 10)) {
						question.isCorrect = true;
						question.isWrong = false;
					} else {
						question.isCorrect = false;
						question.isWrong = true;
					}
				} else {
					if (question.myAnswer.isEvaluated && question.myAnswer.marks === question.marks) {
						question.isCorrect = true;
						question.isWrong = false;
					} else if (question.myAnswer.isEvaluated && question.myAnswer.marks === 0) {
						question.isCorrect = false;
						question.isWrong = true;
					}
				}
			}
		});
		return questions;
	}
	
	private getAnsweredDate(questions) {
		if (questions.length > 0 && questions[0] && questions[0].myAnswer) {
			return moment(questions[0].myAnswer.createdAt).format('Do MMM, YYYY');
		} else {
			return '';
		}
	}
	
	private initializeForms() {
		this.chatForm = this._fb.group({
			description: ['', Validators.required]
		});
		this.questionArray = this._fb.array([]);
		this.answerArray = this._fb.array([]);
		if (this.data.content.questions) {
			this.data.content.questions.forEach(question => {
				this.questionArray.push(this.setContentQuestion(question));
				this.totalRequiredQuestions = 0;
				if (question.myAnswer) {
					this.answerArray.push(this.setContentAnswer(question.myAnswer, question.isRequired));
				} else {
					const answer = {
						answer: '',
						isEvaluated: false,
						marks: 0
					};
					this.answerArray.push(this.setContentAnswer(answer, question.isRequired));
				}
			});
		}
	}
	
	setContentQuestion(question) {
		return this._fb.group({
			id: [question.id],
			question_text: [question.question_text],
			marks: [question.marks],
			word_limit: [question.word_limit],
			options: this._fb.array(this.initOption(question.options)),
			type: [question.type],
			correct_answer: [question.correct_answer],
			isRequired: [question.isRequired]
		});
	}
	
	setContentAnswer(answer, isRequired) {
		if (isRequired) {
			this.totalRequiredQuestions++;
			return this._fb.group({
				answer: [{value: answer.answer, disabled: answer.answer.length > 0}, Validators.required],
				isEvaluated: [answer.isEvaluated],
				marks: [answer.marks]
			});
		} else {
			return this._fb.group({
				answer: [{value: answer.answer, disabled: answer.answer.length > 0}],
				isEvaluated: [answer.isEvaluated],
				marks: [answer.marks]
			});
		}
	}
	
	initOption(options) {
		if (options) {
			const optionArray = [];
			options.forEach(option => {
				optionArray.push(this._fb.control({value: option, disabled: true}));
			});
			return optionArray;
		}
		return [];
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
	
	public submitAnswers() {
		this.savingData = true;
		console.log(this.answerArray.value);
		let i = 0, j = 0;
		this.answerArray.controls.forEach(answer => {
			if (answer.valid && answer.value.answer && answer.value.answer.length > 0) {
				this._collectionService.postAnswers(this.questionArray.controls[i].value.id, answer.value)
					.subscribe(res => {
						j++;
						if (j === this.totalRequiredQuestions) {
							this.showSuccessMessage = true;
							this.savingData = false;
							this._collectionService.notifyOwnerForQuizSubmission(this.questionArray.controls[0].value.id)
								.subscribe(res1 => {
									if (res && res['result'] === 'success') {
										console.log('Notified owner of new submission');
									}
								}, err => {
									console.log('Could not notify owner of new submission. Err: ' + err);
								});
						}
					}, err => {
						j++;
						if (j === this.totalRequiredQuestions) {
							this.snackBar.open('Error submitting your answers. Please try again!', 'OK', {duration: 3000});
							this.savingData = false;
						}
					});
			} else {
				console.log('Not answered. Skipping this question.');
				this.savingData = false;
			}
			i++;
		});
	}
	
	public openQuizSubmission(element) {
		this.dialogsService.openViewQuizSubmissionDialog(element)
			.subscribe(res => {
				if (res) {
					element = res;
				}
			});
	}

}
