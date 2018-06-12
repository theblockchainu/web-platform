import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { ContentService } from '../../_services/content/content.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as _ from 'lodash';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
import { environment } from '../../../environments/environment';
@Component({
    selector: 'app-class-content-online',
    templateUrl: './class-content-online.component.html',
    styleUrls: ['./class-content-online.component.scss']
})

export class ClassContentOnlineComponent implements OnInit {

    public lastIndex: number;
    public envVariable;
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
    public isEdit = false;
    private uploadingImage = false;
    private uploadingAttachments = false;
    private contentId;

    constructor(
        private _fb: FormBuilder,
        private http: HttpClient,
        private mediaUploader: MediaUploaderService,
        private contentService: ContentService,
        @Inject(MAT_DIALOG_DATA) public inputData: any,
        public dialogRef: MatDialogRef<ClassContentOnlineComponent>,
        private requestHeaderService: RequestHeaderService
    ) {
        this.envVariable = environment;
        this.itenaryForm = inputData.itenaryForm;
        this.lastIndex = inputData.index;
        this.isEdit = inputData.isEdit;
        const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
        const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
        this.image = contentForm.controls['imageUrl'];
        this.attachments = contentForm.controls['supplementUrls'];
        this.attachments.value.forEach(file => {
            this.contentService.getMediaObject(file).subscribe((res) => {
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

    imageUploadNew(event) {
        for (const file of event.files) {
            this.mediaUploader.upload(file).map((responseObj: any) => {
                const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
                const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
                contentForm.controls['imageUrl'].patchValue(responseObj.url);
            }).subscribe();
        }
    }

    uploadNew(event) {
        console.log(event.files);
        this.filesToUpload = event.files.length;
        this.filesUploaded = 0;
        for (const file of event.files) {
            this.mediaUploader.upload(file).map((responseObj: any) => {
                const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
                const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
                const supplementUrls = <FormArray>contentForm.controls.supplementUrls;
                supplementUrls.reset();
                supplementUrls.push(this._fb.control(responseObj.url));
                this.filesUploaded++;
            }).subscribe();
        }
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

    /**
     * Get data to return on closing this dialog.
     * @returns {any}
     */
    getSaveDialogData() {
        this.resultData['status'] = 'save';
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
            this.mediaUploader.upload(file).subscribe((response) => {
                this.addImageUrl(response.url);
                this.uploadingImage = false;
            });
        }
    }

    public addImageUrl(value: String) {
        this.image.patchValue(value);
    }

    uploadAttachments(event) {
        this.uploadingAttachments = true;
        for (const file of event.files) {
            this.mediaUploader.upload(file).subscribe((response) => {
                this.addAttachmentUrl(response);
                this.uploadingAttachments = false;
            });
        }
    }

    public addAttachmentUrl(response: any) {
        this.attachments.push(new FormControl(response.url));
        this.attachmentUrls.push(response);
    }

    imgErrorHandler(event) {
        event.target.src = '/assets/images/placeholder-image.jpg';
    }

    deleteFromContainer(fileUrl, fileType) {
        const fileurl = fileUrl;
        fileUrl = _.replace(fileUrl, 'download', 'files');
        this.http.delete(environment.apiUrl + fileUrl, this.requestHeaderService.options)
            .map((response) => {
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
                        this.contentService.getMediaObject(file).subscribe((res) => {
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
            }).subscribe((response) => {

            });

    }

    deleteFromContent(contentForm, body) {
        this.http.patch(environment.apiUrl + '/api/contents/' + contentForm.controls['id'].value, body, this.requestHeaderService.options)
            .map((response: any) => { })
            .subscribe();
    }

}
