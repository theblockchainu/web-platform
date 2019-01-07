import { Component, Inject, OnInit, ViewChild, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { CollectionService } from '../../../_services/collection/collection.service';
import { ContentService } from '../../../_services/content/content.service';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { MatSnackBar, MatTable } from '@angular/material';
import { CommentService } from '../../../_services/comment/comment.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
	selector: 'app-content-quiz',
	templateUrl: './content-quiz.component.html',
	styleUrls: ['./content-quiz.component.scss']
})
export class ContentQuizComponent implements OnInit {

	@Input() data: any;

	public userType = 'public';
	public experienceId = '';
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
	public submissionArray = [];
	public displayedSubmissionTableColumns = ['peerName', 'questionsAnswered'];

	@ViewChild(MatTable) table: MatTable<any>;
	@Output() exitDialog: EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor(
		public _collectionService: CollectionService,
		private _fb: FormBuilder,
		private _commentService: CommentService,
		private _cookieUtilsService: CookieUtilsService,
		private dialogsService: DialogsService,
		private contentService: ContentService,
		private snackBar: MatSnackBar,
		private router: Router
	) {
	}

	ngOnInit() {
		this.envVariable = environment;
		this.userId = this._cookieUtilsService.getValue('userId');
		this.showSuccessMessage = false;
		this.userType = this.data.userType;
		this.experienceId = this.data.collectionId;
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
		this.checkHasAnswered();
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
							if (_.find(this.submissionArray, function (o) { return o.peerId === answer.peer[0].id; })) {
								_.find(this.submissionArray, function (o) { return o.peerId === answer.peer[0].id; }).questionsAnswered++;
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
									_.find(this.submissionArray, function (o) {
										return o.peerId === answer.peer[0].id;
									}).pendingEvaluation++;
								}
							} else {
								const submissionEntry = {
									position: this.submissionArray.length + 1,
									peerId: answer.peer[0].id,
									peerName: answer.peer[0].profiles[0].first_name + ' ' + answer.peer[0].profiles[0].last_name,
									questionsAnswered: 1,
									correctAnswers: 0,
									wrongAnswers: 0,
									pendingEvaluation: 0
								};
								if (question.type === 'single-choice') {
									if (answer.answer === question.correct_answer || parseInt(question.correct_answer, 10) === parseInt(answer.answer, 10)) {
										submissionEntry.correctAnswers++;
									} else {
										submissionEntry.wrongAnswers++;
									}
								} else {
									submissionEntry.pendingEvaluation++;
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

	private checkHasAnswered() {
		if (this.data.content.questions) {
			this.data.content.questions.forEach(question => {
				if (question.answers) {
					question.answers.forEach(answer => {
						if (answer.peer[0].id === this.userId) {
							this.hasAnswered = true;
							this.answeredDate = moment(answer.createdAt).format('Do MMM YY');
							question.myAnswer = answer;
							return;
						}
					});
				}
			});
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
				answer: [{ value: answer.answer, disabled: answer.answer.length > 0 }, Validators.required],
				isEvaluated: [answer.isEvaluated],
				marks: [answer.marks]
			});
		} else {
			return this._fb.group({
				answer: [{ value: answer.answer, disabled: answer.answer.length > 0 }],
				isEvaluated: [answer.isEvaluated],
				marks: [answer.marks]
			});
		}
	}

	initOption(options) {
		if (options) {
			const optionArray = [];
			options.forEach(option => {
				optionArray.push(this._fb.control({ value: option, disabled: true }));
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
		// TODO: view all RSVPs for this content
		this.dialogsService.showRSVP(userType, content, attendies, this.experienceId).subscribe((result: any) => {
			if (result) {
				location.reload();
			}
		});
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
		console.log(this.answerArray.value);
		let i = 0, j = 0;
		this.answerArray.controls.forEach(answer => {
			if (answer.valid && answer.value.answer && answer.value.answer.length > 0) {
				this._collectionService.postAnswers(this.questionArray.controls[i].value.id, answer.value)
					.subscribe(res => {
						j++;
						if (j === this.totalRequiredQuestions) {
							this.showSuccessMessage = true;
						}
					}, err => {
						j++;
						if (j === this.totalRequiredQuestions) {
							this.snackBar.open('Error submitting your answers. Please try again!', 'OK', { duration: 3000 });
						}
					});
			} else {
				console.log('Not answered. Skipping this question.');
			}
			i++;
		});
	}

	exit() {
		this.exitDialog.next();
		this.exitDialog.complete();
	}

}