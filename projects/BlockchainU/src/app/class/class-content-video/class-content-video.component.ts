import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import * as _ from 'lodash';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
import { ContentService } from '../../_services/content/content.service';
import { timer } from 'rxjs';
import { first, map, catchError } from 'rxjs/operators';
declare var YT;

@Component({
    selector: 'app-class-content-video',
    templateUrl: './class-content-video.component.html',
    styleUrls: ['./class-content-video.component.scss']
})

export class ClassContentVideoComponent implements OnInit, AfterViewInit {

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
    private uploadingVideo;
    private uploadingAttachments;
    public attachments: any;
    public attachmentUrls = [];
    public loadingUploadedVideo: any;
    public youtubeEmbed: boolean;
    public videoId: string;
    public player: any;

    constructor(
        private _fb: FormBuilder,
        private http: HttpClient,
        private mediaUploader: MediaUploaderService,
        @Inject(MAT_DIALOG_DATA) public inputData: any,
        public dialogRef: MatDialogRef<ClassContentVideoComponent>,
        private requestHeaderService: RequestHeaderService,
        private contentService: ContentService,
        private matSnackBar: MatSnackBar
    ) {
        this.envVariable = environment;
        this.itenaryForm = inputData.itenaryForm;
        this.lastIndex = inputData.index;
        this.isEdit = inputData.isEdit;
        const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
        const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
        this.urlForVideo = contentForm.controls['imageUrl'].value;
        this.attachments = contentForm.controls['supplementUrls'];
        this.attachments.value.forEach(file => {
            this.contentService.getMediaObject(file).subscribe((res: any) => {
                this.attachmentUrls.push(res[0]);
            });
        });
        console.log(this.attachmentUrls);
    }

    ngAfterViewInit() {
        this.getIFRAME();
        console.log('got i frame');

    }

    ngOnInit(): void {
        const content = <FormArray>this.itenaryForm.controls.contents;
        this.lastIndex = this.lastIndex !== -1 ? this.lastIndex : content.controls.length - 1;
        this.resultData['data'] = this.lastIndex;
        this.youtubeEmbed = false;
        this.youtubeEmbed = this.itenaryForm.value.contents[this.lastIndex].youtubeId && this.itenaryForm.value.contents[this.lastIndex].youtubeId.length > 3;
    }

    private initYoutube(videoId: string) {
        console.log('setting youtube');
        const youtubeId = this.itenaryForm.value.contents[this.lastIndex].youtubeId;
        if (youtubeId) {
            this.player.loadVideoById(videoId, 0, 'large');
        } else {
            this.player = new YT.Player('ytplayer-' + this.lastIndex, {
                height: '390',
                width: '100%',
                videoId: videoId,
                events: {
                    'onError': (error) => {
                        console.log(error);

                    },
                    'onReady': (event) => {
                        console.log(event);
                        console.log(event.target.getDuration());
                        const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
                        const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
                        contentForm.controls['videoLength'].patchValue(parseInt(event.target.getDuration(), 10));
                    },
                    'onStateChange': (event) => {
                        console.log(event);
                        console.log(event.target.getDuration());
                        const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
                        const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
                        contentForm.controls['videoLength'].patchValue(parseInt(event.target.getDuration(), 10));
                    }
                },
                playerVars: {
                    'autoplay': 1,
                    'modestbranding': 1,
                    'origin': environment.clientUrl
                },

            });
        }

    }

    private getIFRAME() {
        const doc = (<any>window).document;
        const playerApiScript = doc.createElement('script');
        playerApiScript.type = 'text/javascript';
        playerApiScript.src = 'https://www.youtube.com/iframe_api';
        doc.body.appendChild(playerApiScript);
        console.log('youtube loaded');
        const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
        const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
        const youtubeId = <FormArray>contentForm.controls.youtubeId;
        console.log('youtubeId.valueChanges.subscribe');
        youtubeId.valueChanges.subscribe(res => {
            console.log(res);
            this.initYoutube(res);
        });
    }

    public imageUploadNew(uploadedObject) {
        console.log(uploadedObject);
        const url = uploadedObject.url;
        this.mediaUploader
            .getDownloadUrl(uploadedObject.name)
            .subscribe(res => {
                console.log(res);
                this.urlForVideo = res;
                this.loadingUploadedVideo = true;
                const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
                const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
                contentForm.controls['imageUrl'].patchValue(url);
            }, err => {
                console.log('err');
                console.log(err);
            });

    }

    deleteFromContainer(fileUrl, fileType) {
        const fileurl = fileUrl;
        fileUrl = _.replace(fileUrl, 'download', 'files');
        this.mediaUploader.delete(fileUrl).pipe(first())
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
                } else if (fileType === 'video') {
                    this.urlForVideo = '';
                    const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
                    const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
                    if (contentForm.controls['id'].value) {
                        this.contentService.patchContent(contentForm.controls['id'].value, { 'imageUrl': '' }).subscribe(
                            res => {
                                contentForm.controls['imageUrl'].patchValue(this.urlForVideo);
                                contentForm.controls['videoLength'].patchValue(0);
                                delete this.urlForVideo;
                            }
                        );
                    }
                }
            });

    }

    onVideoReady(event: any) {
        console.log(event);
    }

    addAttachmentUrl(url: string) {
        console.log('Adding image url: ' + url);
        this.attachments.push(new FormControl(url));
        this.contentService.getMediaObject(url).subscribe((res: any) => {
            this.attachmentUrls.push(res[0]);
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

    onMetadata(e, video) {
        console.log('metadata: ', e);
        console.log('duration: ' + video.duration);
        const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
        const contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
        contentForm.controls['videoLength'].patchValue(video.duration);
        this.loadingUploadedVideo = false;
    }

    videoError(err) {
        console.log(err);
    }

    onYouTubeIframeAPIReady() {
        // creates the player object
        const ik_player = new YT.Player('ik_player_iframe');
        console.log('Video API is loaded');
        console.log(ik_player);
    }
}


