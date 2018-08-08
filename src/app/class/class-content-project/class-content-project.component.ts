import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as _ from 'lodash';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
import { ContentService } from '../../_services/content/content.service';
import { environment } from '../../../environments/environment';
@Component({
	selector: 'app-class-content-project',
	templateUrl: './class-content-project.component.html',
	styleUrls: ['./class-content-project.component.scss']
})

export class ClassContentProjectComponent implements OnInit {

	public lastIndex: number;
	public envVariable;
	public filesToUpload: number;
	public filesUploaded: number;
	public itenaryForm: FormGroup;
	public resultData = {
		status: 'discard',
		data: 0
	};
	public isEdit = false;
	public collectionStartDate;
	public collectionEndDate;
	public urlForVideo;
	public mediaObject;
	private uploadingVideo;
	private uploadingAttachments;
	public attachments: any;
	public attachmentUrls = [];

	constructor(
		private _fb: FormBuilder,
		private http: HttpClient,
		private mediaUploader: MediaUploaderService,
		@Inject(MAT_DIALOG_DATA) public inputData: any,
		public dialogRef: MatDialogRef<ClassContentProjectComponent>,
		private requestHeaderService: RequestHeaderService,
		private contentService: ContentService
	) {
		this.envVariable = environment;
		this.collectionEndDate = inputData.collectionEndDate;
		this.collectionStartDate = inputData.collectionStartDate;
		this.itenaryForm = inputData.itenaryForm;
		this.lastIndex = inputData.index;
		this.isEdit = inputData.isEdit;
		const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
		const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
		this.urlForVideo = contentForm.controls['imageUrl'].value;
		this.contentService.getMediaObject(this.urlForVideo).subscribe((res : any) => {
			this.mediaObject = res[0];
		});
		this.attachments = contentForm.controls['supplementUrls'];
		this.attachments.value.forEach(file => {
			this.contentService.getMediaObject(file).subscribe((res : any) => {
				this.attachmentUrls.push(res[0]);
			});
		});
		console.log(this.attachmentUrls);
	}

	ngOnInit(): void {
		const content = <FormArray>this.itenaryForm.controls.contents;
		this.lastIndex = this.lastIndex !== -1 ? this.lastIndex : content.controls.length - 1;
		this.resultData['data'] = this.lastIndex;
	}

	addAttachmentUrl(url: any) {
		console.log('Adding image url: ' + url);
		this.attachments.push(new FormControl(url));
		this.contentService.getMediaObject(url).subscribe((res : any) => {
			this.attachmentUrls.push(res[0]);
		});
	}

	deleteFromContainer(fileUrl, fileType) {
		const fileurl = fileUrl;
		fileUrl = _.replace(fileUrl, 'download', 'files');
		this.http.delete(environment.apiUrl + fileUrl, this.requestHeaderService.options)
			.subscribe((response : any) => {
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
						this.contentService.getMediaObject(file).subscribe((res : any) => {
							this.attachmentUrls.push(res[0]);
						});
					});
				} else {
					this.urlForVideo = '';
					this.mediaObject = {};
					const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
					const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
					contentForm.controls['imageUrl'].patchValue(this.urlForVideo);
					if (contentForm.controls['id'].value) {
						this.deleteFromContent(contentForm, { 'imageUrl': '' });
					}
				}
			});

	}

	deleteFromContent(contentForm, body) {
		this.http.patch(environment.apiUrl + '/api/contents/' + contentForm.controls['id'].value, body, this.requestHeaderService.options)
			.subscribe();
	}

	imageUploadNew(url) {

		this.urlForVideo = url;
		const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
		const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
		contentForm.controls['imageUrl'].patchValue(url);
		this.contentService.getMediaObject(url).subscribe((res : any) => {
			this.mediaObject = res;
		});

	}

	resetNewUrls(event) {
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

	itemEditRemoved(event) {
		delete this.filesToUpload;
		this.filesUploaded = 0;
		// this.deleteFromContainer(event);
	}

	/**
	 * Get data to return on closing this dialog.
	 * @returns {any}
	 */
	getSaveDialogData() {
		this.resultData['status'] = 'save';
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
	 * Get data to return on editing this dialog.
	 * @returns {any}
	 */
	getEditDialogData() {
		this.resultData['status'] = 'edit';
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

}
