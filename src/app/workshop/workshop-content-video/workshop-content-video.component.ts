import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import {environment} from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as _ from 'lodash';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
import { ContentService } from '../../_services/content/content.service';

@Component({
    selector: 'app-workshop-content-video',
    templateUrl: './workshop-content-video.component.html',
    styleUrls: ['./workshop-content-video.component.scss']
})

export class WorkshopContentVideoComponent implements OnInit {

    public lastIndex: number;
    public filesToUpload: number;
    public filesUploaded: number;
    public envVariable;
    public itenaryForm: FormGroup;
    public resultData = {
        status: 'discard',
        data: 0
    };
    public isEdit = false;
    public urlForVideo;
    private options;
    private uploadingVideo;
    private uploadingAttachments;
    public attachments: any;
    public attachmentUrls = [];

    constructor(
        private _fb: FormBuilder,
        private http: HttpClient,
        private mediaUploader: MediaUploaderService,
        @Inject(MAT_DIALOG_DATA) public inputData: any,
        public dialogRef: MatDialogRef<WorkshopContentVideoComponent>,
        private requestHeaders: RequestHeaderService,
        private contentService: ContentService
    ) {
        this.envVariable = environment;
        this.options = requestHeaders.getOptions();
        this.itenaryForm = inputData.itenaryForm;
        this.lastIndex = inputData.index;
        this.isEdit = inputData.isEdit;
        const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
        const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
        this.urlForVideo = contentForm.controls['imageUrl'].value;
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
        this.uploadingVideo = true;
        for (const file of event.files) {
            this.mediaUploader.upload(file).subscribe((response) => {
                this.urlForVideo = response.url;
                const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
                const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
                contentForm.controls['imageUrl'].patchValue(response.url);
                this.uploadingVideo = false;
            });
        }
    }

    deleteFromContainer(fileUrl, fileType) {
        const fileurl = fileUrl;
        fileUrl = _.replace(fileUrl, 'download', 'files');
        this.http.delete(environment.apiUrl + fileUrl, this.options)
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
                } else if (fileType === 'video') {
                    this.urlForVideo = '';
                    const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
                    const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
                    contentForm.controls['imageUrl'].patchValue(this.urlForVideo);
                    if (contentForm.controls['id'].value) {
                        this.deleteFromContent(contentForm, { 'imageUrl': '' });
                    }
                }
            }).subscribe();

    }

    deleteFromContent(contentForm, body) {
        this.http.patch(environment.apiUrl + '/api/contents/' + contentForm.controls['id'].value, body, this.options)
            .map((response) => { })
            .subscribe();
    }

    //   deleteFromContainerArr(event, fileType) {
    //     for (let i = 0; i < event.target.files.length; i++) {
    //       let file = event.target.files[i];
    //       const fileurl = file;
    //       file = _.replace(file, 'download', 'files');
    //       this.http.delete(environment.apiUrl + file)
    //         .map((response) => {
    //           console.log(response);
    //           if (fileType === 'video') {
    //             this.urlForVideo = _.remove(this.urlForVideo, function (n) {
    //               return n !== fileurl;
    //             });
    //             this.workshop.controls.videoUrls.patchValue(this.urlForVideo);
    //           } else if (fileType === 'image') {
    //             this.urlForImages = _.remove(this.urlForImages, function (n) {
    //               return n !== fileurl;
    //             });
    //             this.workshop.controls.imageUrls.patchValue(this.urlForImages);
    //           }
    //         }).subscribe();

    //     }
    //   }


    uploadNew(event) {
        console.log(event.files);
        this.filesToUpload = event.files.length;
        this.filesUploaded = 0;
        this.uploadingAttachments = true;
        for (const file of event.files) {
            this.mediaUploader.upload(file).subscribe((response) => {
                this.addAttachmentUrl(response);
                this.filesUploaded++;
                this.uploadingAttachments = false;
            });
        }
    }

    addAttachmentUrl(response: any) {
        console.log('Adding image url: ' + response.url);
        this.attachments.push(new FormControl(response.url));
        this.attachmentUrls.push(response);
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
        console.log('changing result data to save');
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
        console.log('changing result data to save');
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
