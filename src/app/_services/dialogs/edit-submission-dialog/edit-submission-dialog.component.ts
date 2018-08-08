import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { MediaUploaderService } from '../../mediaUploader/media-uploader.service';
import { ProjectSubmissionService } from '../../project-submission/project-submission.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';

import { ContentService } from '../../content/content.service';
import { environment } from '../../../../environments/environment';
import * as _ from 'lodash';
import { RequestHeaderService } from '../../requestHeader/request-header.service';

@Component({
	selector: 'app-edit-submission-dialog',
	templateUrl: './edit-submission-dialog.component.html',
	styleUrls: ['./edit-submission-dialog.component.scss']
})
export class EditSubmissionDialogComponent implements OnInit {

	public userId;
	public envVariable;
	public submitEntryForm: any = FormGroup;
	public imageUrl: string;
	public submissionTopics = [];
	public removedTopics = [];
	public relTopics = [];
	public isPrivate: boolean;
	public submissionId;
	public submissionView;
	public savingDraft = false;
	public loader = 'assets/images/ajax-loader.gif';
	public uploadingImage = false;
	public urlForImages = [];
	public searchTopicURL;
	public createTopicURL;
	public placeholderStringTopic = 'Submission Tag';
	public maxTopicMsg = 'Choose max 3 related tags';

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private _fb: FormBuilder,
		public http: HttpClient,
		private mediaUploader: MediaUploaderService,
		public projectSubmissionService: ProjectSubmissionService,
		private _cookieUtilsService: CookieUtilsService,
		private _contentService: ContentService,
		private requestHeaderService: RequestHeaderService,
		public dialogRef: MatDialogRef<EditSubmissionDialogComponent>
	) {
		this.envVariable = environment;
		this.userId = _cookieUtilsService.getValue('userId');
		this.searchTopicURL = environment.searchUrl + '/api/search/'
			+ environment.uniqueDeveloperCode + '_topics/suggest?field=name&query=';
		this.createTopicURL = environment.apiUrl + '/api/' + environment.uniqueDeveloperCode + '_topics';
	}

	ngOnInit() {
		console.log(this.data);
		this.submitEntryForm = this._fb.group({
			name: [this.data.submission.name],
			picture_url: [''],
			description: [this.data.submission.description],
			isPrivate: [this.data.submission.isPrivate]
		});
		this.addImageUrl(this.data.submission.picture_url);
	}

	publishView() {
		const submissionForm = {
			name: this.submitEntryForm.controls['name'].value,
			description: this.submitEntryForm.controls['description'].value,
			picture_url: this.submitEntryForm.controls['picture_url'].value,
			isPrivate: this.submitEntryForm.controls['isPrivate'].value
		};
		this.savingDraft = true;
		this.projectSubmissionService.updateSubmission(this.data.submission.id, submissionForm).subscribe((response: any) => {
			if (response) {
				this.submissionView = response;
				this.savingDraft = false;
				this.dialogRef.close(true);
			}
		});
	}

	public deleteFromContainer(fileUrl, fileType) {
		const fileurl = fileUrl;
		fileUrl = _.replace(fileUrl, 'download', 'files');
		this.http.delete(environment.apiUrl + fileUrl, this.requestHeaderService.options)
			.map((response) => {
				console.log(response);
				this.urlForImages = [];
				this.submitEntryForm.controls['picture_url'].patchValue('');
			}).subscribe();
	}

	uploadImage(event) {
		this.uploadingImage = true;
		for (const file of event.files) {
			this.mediaUploader.upload(file).subscribe((response) => {
				this.addImageUrl(response.url);
				this.uploadingImage = false;
			});
		}
	}

	public addImageUrl(value) {
		console.log('Adding image url: ' + value);
		this._contentService.getMediaObject(value).subscribe((res) => {
			this.urlForImages.push(res[0]);
		});
		const control = <FormArray>this.submitEntryForm.controls['picture_url'];
		control.patchValue(value);
	}

}
