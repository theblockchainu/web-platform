import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestHeaderService } from '../requestHeader/request-header.service';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';
import * as _ from 'lodash';
import {Observable} from 'rxjs';

@Injectable()
export class AssessmentService {


	constructor(private httpClient: HttpClient,
		public _requestHeaderService: RequestHeaderService
	) {
	}

	public submitAssessment(assessment: Array<AssessmentResult>) {
		return this.httpClient.post(environment.apiUrl + '/api/assessment_results', assessment, this._requestHeaderService.options);
	}
	
	public reissueCertificate(body) {
		return this.httpClient.post(environment.apiUrl + '/api/assessment_results/reissue-certificate', body, this._requestHeaderService.options);
	}

	public getAssessmentItems(fileLocation: string) {
		return this.httpClient.get(fileLocation, this._requestHeaderService.options);
	}


	public getAvailableAssessments(): Array<AssessmentTypeData> {
		return [
			{
				system: 'Standard Grades',
				values: {
					style: 'Grades',
					rules: [
						{
							value: 'A',
							gyan: 100
						},
						{
							value: 'B',
							gyan: 90
						},
						{
							value: 'C',
							gyan: 80
						},
						{
							value: 'D',
							gyan: 70
						},
						{
							value: 'F',
							gyan: 60
						}
					]
				},
				description: 'A, B, C, D ...'
			},
			{
				system: 'Weighted Grades',
				values: {
					style: 'Grades',
					rules: [
						{
							value: 'A+',
							gyan: 100
						},
						{
							value: 'A',
							gyan: 97
						},
						{
							value: 'A-',
							gyan: 93
						},
						{
							value: 'B+',
							gyan: 90
						},
						{
							value: 'B',
							gyan: 87
						},
						{
							value: 'B-',
							gyan: 83
						},
						{
							value: 'C+',
							gyan: 80
						},
						{
							value: 'C',
							gyan: 77
						},
						{
							value: 'C-',
							gyan: 73
						},
						{
							value: 'D+',
							gyan: 70
						},
						{
							value: 'D',
							gyan: 67
						},
						{
							value: 'D-',
							gyan: 63
						},
						{
							value: 'F',
							gyan: 60
						}
					]
				},
				description: 'A+, A, A-, B+, B, B- ...'
			},
			{
				system: 'Percentage',
				values: {
					style: 'Percentage',
					rules: [
						{
							value: '100',
							gyan: 100
						},
						{
							value: '90',
							gyan: 90
						},
						{
							value: '80',
							gyan: 80
						},
						{
							value: '70',
							gyan: 70
						},
						{
							value: '60',
							gyan: 60
						},
						{
							value: '50',
							gyan: 50
						},
						{
							value: '40',
							gyan: 40
						},
						{
							value: '30',
							gyan: 30
						},
						{
							value: '20',
							gyan: 20
						},
						{
							value: '10',
							gyan: 10
						}
					]
				},
				description: '100%, 90%, 80% ...'
			},
			{
				system: 'Binary',
				values: {
					style: 'Grades',
					rules: [
						{
							value: 'Pass',
							gyan: 100
						},
						{
							value: 'Fail',
							gyan: 1
						}
					]
				},
				description: 'Pass / Fail'
			}
		];

	}
	
	public processQuizSubmissions(quizContent) {
		const submissionArray = [];
		if (quizContent.questions) {
			quizContent.questions.forEach(question => {
				if (question.answers) {
					question.answers.forEach(answer => {
						if (answer.peer) {
							// If the answer is by a peer who already has an entry in this array
							if (_.find(submissionArray, function(o) { return o.peerId === answer.peer[0].id; })) {
								_.find(submissionArray, function(o) { return o.peerId === answer.peer[0].id; }).questionsAnswered++;
								if (question.type === 'single-choice') {
									if (answer.answer === question.correct_answer || parseInt(question.correct_answer, 10) === parseInt(answer.answer, 10)) {
										_.find(submissionArray, function (o) {
											return o.peerId === answer.peer[0].id;
										}).correctAnswers++;
									} else {
										_.find(submissionArray, function (o) {
											return o.peerId === answer.peer[0].id;
										}).wrongAnswers++;
									}
								} else {
									if (answer.isEvaluated && answer.marks === question.marks) {
										_.find(submissionArray, function (o) {
											return o.peerId === answer.peer[0].id;
										}).correctAnswers++;
									} else if (answer.isEvaluated && answer.marks === 0) {
										_.find(submissionArray, function (o) {
											return o.peerId === answer.peer[0].id;
										}).wrongAnswers++;
									} else {
										_.find(submissionArray, function (o) {
											return o.peerId === answer.peer[0].id;
										}).pendingEvaluation++;
									}
								}
							} else {
								const questions = _.cloneDeep(quizContent.questions);
								const submissionEntry = {
									position: submissionArray.length + 1,
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
								submissionArray.push(submissionEntry);
							}
						}
					});
				}
			});
			// Work on the submission array to mark user's answer for each question and whether the answer is correct
			submissionArray.forEach(submission => {
				submission.questions = this.checkHasAnswered(submission.questions, submission.peerId);
				submission.questions = this.evaluateMyAnswers(submission.questions);
				submission.answeredDate = this.getAnsweredDate(submission.questions);
			});
			return new Observable(obs => {
				obs.next(submissionArray);
			});
		} else {
			return new Observable(obs => {
				obs.next(submissionArray);
			});
		}
	}
	
	
	private checkHasAnswered(questions, userId) {
		if (questions) {
			questions.forEach(question => {
				let myAnswer = null;
				if (question.answers) {
					question.answers.forEach(answer => {
						if (answer.peer !== undefined && answer.peer[0].id === userId) {
							myAnswer = answer;
						}
					});
				}
				question['myAnswer'] = myAnswer;
			});
		}
		return questions;
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
	
	public checkHasAnsweredQuiz(submissions, userId, loggedinPeerId) {
		let hasAnswered = false;
		if (submissions) {
			submissions.forEach(submission => {
				if (submission.questions) {
					submission.questions.forEach(question => {
						if (question.answers) {
							question.answers.forEach(answer => {
								if (answer.peer !== undefined && answer.peer[0].id === userId) {
									if (userId === loggedinPeerId) {
										hasAnswered = true;
									}
								}
							});
						}
					});
				}
			});
		}
		return hasAnswered;
	}
	
	public getQuizAnsweredDate(submissions, userId, loggedinPeerId) {
		let answeredDate = '';
		if (submissions) {
			submissions.forEach(submission => {
				if (submission.questions) {
					submission.questions.forEach(question => {
						if (question.answers) {
							question.answers.forEach(answer => {
								if (answer.peer !== undefined && answer.peer[0].id === userId) {
									if (userId === loggedinPeerId) {
										answeredDate = moment(answer.createdAt).format('Do MMM YY');
									}
								}
							});
						}
					});
				}
			});
		}
		return answeredDate;
	}

}

interface AssessmentResult {
	calendarId: string;
	assesserId: string;
	assesseeId: string;
	assessmentRuleId: string;
}

interface AssessmentTypeData {
	system: string;
	values: {
		style: string;
		rules?: Array<{
			value: string,
			gyan: number
		}>;
	};
	description: string;
}
