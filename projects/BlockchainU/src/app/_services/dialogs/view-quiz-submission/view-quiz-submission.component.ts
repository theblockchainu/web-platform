import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {CookieUtilsService} from '../../cookieUtils/cookie-utils.service';
import {environment} from '../../../../environments/environment';
import {CollectionService} from '../../collection/collection.service';
import {ProfileService} from '../../profile/profile.service';
import {FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-view-quiz-submission',
  templateUrl: './view-quiz-submission.component.html',
  styleUrls: ['./view-quiz-submission.component.scss']
})
export class ViewQuizSubmissionComponent implements OnInit {
	
	public userId;
	public envVariable;
	public questionArray;
	public answerArray;
	public totalRequiredQuestions = 0;
	public savingData = false;
	
	constructor(public dialogRef: MatDialogRef<ViewQuizSubmissionComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any,
				private dialog: MatDialog,
				public _collectionService: CollectionService,
				public snackBar: MatSnackBar,
				public _profileService: ProfileService,
				public _cookieUtilsService: CookieUtilsService,
				private _fb: FormBuilder
	) {
		this.envVariable = environment;
	}
	
	ngOnInit() {
		this.userId = this._cookieUtilsService.getValue('userId');
		this.initializeForms();
	}
	
	private initializeForms() {
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
			isRequired: [question.isRequired],
			isCorrect: [question.isCorrect],
			isWrong: [question.isWrong],
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
	
	public updateMarks() {
		this.dialogRef.close(this.data.content);
	}
	
	public markAsCorrect(index) {
		if (this.data.content.questions[index].myAnswer) {
			this.savingData = true;
			this.data.content.questions[index].myAnswer.isEvaluated = true;
			this.data.content.questions[index].myAnswer.marks = this.data.content.questions[index].marks;
			this._collectionService.patchAnswer(this.data.content.questions[index].myAnswer.id, this.data.content.questions[index].myAnswer)
				.subscribe(res => {
					console.log(res);
					this.questionArray.controls[index].controls['isCorrect'].patchValue(true);
					this.questionArray.controls[index].controls['isWrong'].patchValue(false);
					this.data.content.questions[index].isCorrect = true;
					this.data.content.questions[index].isWrong = false;
					this.data.content.correctAnswers++;
					this.data.content.pendingEvaluation--;
					this.savingData = false;
				}, err => {
					this.savingData = false;
					this.snackBar.open('Could not mark the answer as correct. Please try again.', 'OK', {duration: 5000});
				});
		}
	}
	
	public markAsIncorrect(index) {
		if (this.data.content.questions[index].myAnswer) {
			this.savingData = true;
			this.data.content.questions[index].myAnswer.isEvaluated = true;
			this.data.content.questions[index].myAnswer.marks = 0;
			this._collectionService.patchAnswer(this.data.content.questions[index].myAnswer.id, this.data.content.questions[index].myAnswer)
				.subscribe(res => {
					console.log(res);
					this.questionArray.controls[index].controls['isCorrect'].patchValue(false);
					this.questionArray.controls[index].controls['isWrong'].patchValue(true);
					this.data.content.questions[index].isCorrect = false;
					this.data.content.questions[index].isWrong = true;
					this.data.content.wrongAnswers++;
					this.data.content.pendingEvaluation--;
					this.savingData = false;
				}, err => {
					this.savingData = false;
					this.snackBar.open('Could not mark the answer as in-correct. Please try again.', 'OK', {duration: 5000});
				});
		}
		
	}

}
