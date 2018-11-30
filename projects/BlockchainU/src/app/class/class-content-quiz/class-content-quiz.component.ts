import {Component, Inject, OnInit} from '@angular/core';
import {ContentService} from '../../_services/content/content.service';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {environment} from '../../../environments/environment';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';
import {DataSharingService} from '../../_services/data-sharing-service/data-sharing.service';
import {HttpClient} from '@angular/common/http';
import {MediaUploaderService} from '../../_services/mediaUploader/media-uploader.service';
import {RequestHeaderService} from '../../_services/requestHeader/request-header.service';
import * as _ from 'lodash';

@Component({
	selector: 'app-class-content-quiz',
	templateUrl: './class-content-quiz.component.html',
	styleUrls: ['./class-content-quiz.component.scss']
})
export class ClassContentQuizComponent implements OnInit {
	
	public lastIndex: number;
	public filesToUpload: number;
	public filesUploaded: number;
	public itenaryForm: FormGroup;
	public image: any;
	public attachments: any;
	public attachmentUrls = [];
	public resultData = {
		status: 'discard',
		data: 0
	};
	public envVariable;
	public isEdit = false;
	private uploadingImage = false;
	private uploadingAttachments = false;
	private contentId;
	public contentsFArray;
	public contentForm;
	public questionArray;
	public questionTypes = [
		{name: 'Short Answer', value: 'short-text'},
		{name: 'Long Answer', value: 'long-text'},
		{name: 'Single Choice', value: 'single-choice'}
	];
	
	
	constructor(
		private _fb: FormBuilder,
		private http: HttpClient,
		private mediaUploader: MediaUploaderService,
		private contentService: ContentService,
		@Inject(MAT_DIALOG_DATA) public inputData: any,
		public dialogRef: MatDialogRef<ClassContentQuizComponent>,
		private requestHeaderService: RequestHeaderService,
		private dialog: MatDialog,
		private dataSharingService: DataSharingService
	) {
		this.envVariable = environment;
		this.itenaryForm = inputData.itenaryForm;
		this.lastIndex = inputData.index;
		this.isEdit = inputData.isEdit;
		this.contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
		this.contentForm = <FormGroup>this.contentsFArray.controls[this.lastIndex];
		this.questionArray = <FormArray>this.contentForm.controls['questions'];
		console.log('contentform');
		console.log(this.contentForm);
		this.image = this.contentForm.controls['imageUrl'];
		this.attachments = this.contentForm.controls['supplementUrls'];
		this.attachments.value.forEach(file => {
			this.contentService.getMediaObject(file).subscribe((res: any) => {
				this.attachmentUrls.push(res[0]);
			});
		});
		
	}
	
	ngOnInit(): void {
		if (this.questionArray.length === 0) {
			this.questionArray.push(
				this.initcontentQuestion()
			);
		}
		const content = <FormArray>this.itenaryForm.controls.contents;
		this.lastIndex = this.lastIndex !== -1 ? this.lastIndex : content.controls.length - 1;
		this.resultData['data'] = this.lastIndex;
	}
	
	imageUploadNew(event) {
		for (const file of event.files) {
			this.mediaUploader.upload(file).subscribe((responseObj: any) => {
				const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
				const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
				contentForm.controls['imageUrl'].patchValue(responseObj.url);
			});
		}
	}
	
	uploadNew(event) {
		console.log(event.files);
		this.filesToUpload = event.files.length;
		this.filesUploaded = 0;
		for (const file of event.files) {
			this.mediaUploader.upload(file).subscribe((responseObj: any) => {
				const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
				const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
				const supplementUrls = <FormArray>contentForm.controls.supplementUrls;
				supplementUrls.reset();
				supplementUrls.push(this._fb.control(responseObj.url));
				this.filesUploaded++;
			});
		}
	}
	
	resetNewUrls(event) {
		console.log(event);
		const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
		const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
		const supplementUrls = <FormArray>contentForm.controls.supplementUrls;
		supplementUrls.reset();
		this.resetProgressBar();
	}
	
	resetProgressBar() {
		delete this.filesToUpload;
		delete this.filesUploaded;
	}
	
	/**
	 * Get data to return on closing this dialog.
	 * @returns {any}
	 */
	getSaveDialogData() {
		// console.log('changing result data to save');
		this.resultData['status'] = 'save';
		return JSON.stringify(this.resultData);
	}
	
	/**
	 * Get data to return on editing this dialog.
	 * @returns {any}
	 */
	getEditDialogData() {
		// console.log('changing result data to save');
		this.resultData['status'] = 'edit';
		return JSON.stringify(this.resultData);
	}
	
	/**
	 * Get data to return on discarding this dialog
	 * @returns {any}
	 */
	getDiscardDialogData() {
		this.resultData['status'] = 'discard';
		return JSON.stringify(this.resultData);
	}
	
	/**
	 * Get data to return on discarding this dialog
	 * @returns {any}
	 */
	getDeleteDialogData() {
		this.resultData['status'] = 'delete';
		return JSON.stringify(this.resultData);
	}
	
	/**
	 * Get data to return on discarding this dialog
	 * @returns {any}
	 */
	getCloseDialogData() {
		this.resultData['status'] = 'close';
		return JSON.stringify(this.resultData);
	}
	
	/**
	 * Get title text based on edit mode or add mode
	 * @returns {any}
	 */
	getAddOrEditText() {
		if (!this.isEdit) {
			return 'Add';
		} else {
			return 'Edit';
		}
	}
	
	uploadImage(event) {
		this.uploadingImage = true;
		for (const file of event.files) {
			this.mediaUploader.upload(file).subscribe((response: any) => {
				this.addImageUrl(response.url);
				this.uploadingImage = false;
			});
		}
	}
	
	public addImageUrl(value: String) {
		console.log('Adding image url: ' + value);
		this.image.patchValue(value);
	}
	
	public addAttachmentUrl(url: string) {
		// console.log('Adding image url: ' + value);
		this.attachments.push(new FormControl(url));
		this.contentService.getMediaObject(url).subscribe((res: any) => {
			this.attachmentUrls.push(res[0]);
		});
	}
	
	imgErrorHandler(event) {
		event.target.src = '/assets/images/placeholder-image.jpg';
	}
	
	deleteFromContainer(fileUrl, fileType) {
		const fileurl = fileUrl;
		fileUrl = _.replace(fileUrl, 'download', 'files');
		this.http.delete(environment.apiUrl + fileUrl, this.requestHeaderService.options)
			.subscribe((response: any) => {
				console.log(response);
				if (fileType === 'file') {
					const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
					const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
					const supplementUrls = <FormArray>contentForm.controls.supplementUrls;
					let suppUrl = supplementUrls.value;
					suppUrl = _.remove(suppUrl, function (n) {
						return n !== fileurl;
					});
					contentForm.controls['supplementUrls'] = new FormArray([]);
					this.attachmentUrls = [];
					suppUrl.forEach(file => {
						supplementUrls.push(new FormControl(file));
						this.contentService.getMediaObject(file).subscribe((res: any) => {
							this.attachmentUrls.push(res[0]);
						});
					});
					if (contentForm.controls['id'].value) {
						this.deleteFromContent(contentForm, { 'supplementUrls': [] });
					}
				} else if (fileType === 'image') {
					this.addImageUrl('');
					const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
					const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
					contentForm.controls['imageUrl'].patchValue('');
					if (contentForm.controls['id'].value) {
						this.deleteFromContent(contentForm, { 'imageUrl': '' });
					}
				}
			});
		
	}
	
	deleteFromContent(contentForm, body) {
		this.http.patch(environment.apiUrl + '/api/contents/' + contentForm.controls['id'].value, body, this.requestHeaderService.options)
		;
	}
	
	addQuestion() {
		this.questionArray.push(
			this.initcontentQuestion()
		);
	}
	
	initcontentQuestion() {
		return this._fb.group({
			question_text: [''],
			marks: 1,
			word_limit: 1000,
			options: this._fb.array([]),
			type: ['short-text'],
			correct_answer: 0
		});
	}
	
	addOption(index: number) {
		const questionForm = <FormGroup>this.questionArray.controls[index];
		const optionsFormArray = <FormArray>questionForm.controls['options'];
		optionsFormArray.push(this.initOption());
	}
	
	initOption() {
		return this._fb.control('');
	}
	
	questionTypeChange(event, index) {
		switch (event.value) {
			case 'long-text':
				this.questionArray.controls[index].controls['word_limit'].setValue(5000);
				break;
			case 'short-text':
				this.questionArray.controls[index].controls['word_limit'].setValue(1000);
				break;
			case 'single-choice':
				this.addOption(index);
				this.questionArray.controls[index].controls['word_limit'].setValue(1000);
				break;
			default:
				break;
		}
	}
	
	setCorrectAnswer(event, questionIndex, optionIndex) {
		this.questionArray.controls[questionIndex].controls['correct_answer'].setValue('' + event.value);
	}
	
	removeQuestion(index) {
		this.questionArray.removeAt(index);
	}
	
	removeOption(questionIndex, optionIndex) {
		this.questionArray.controls[questionIndex].controls['options'].removeAt(optionIndex);
	}
	
	checkCorrectAnswer(questionIndex, optionIndex) {
		console.log('correct answer: ' + this.questionArray.controls[questionIndex].controls['correct_answer'] + ', optionIndex: ' + optionIndex);
		return this.questionArray.controls[questionIndex].controls['correct_answer'] === optionIndex.toString();
	}
	
}
