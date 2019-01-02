import {Component, Inject, OnInit, AfterViewInit, ViewChild, Renderer2} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import * as _ from 'lodash';
import { RequestHeaderService } from '../../_services/requestHeader/request-header.service';
import { ContentService } from '../../_services/content/content.service';
import { first } from 'rxjs/operators';
import {MatVideoComponent} from 'mat-video/esm2015/app/video/video.component';
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
	public signedUrlForStreaming;
	public secureVideoUrl;
	public attachments: any;
	public attachmentUrls = [];
	public loadingUploadedVideo: any;
	public youtubeEmbed: boolean;
	public player: any;
	private contentForm;
	
	@ViewChild('video') matVideo: MatVideoComponent;
	video: HTMLVideoElement;
	
	constructor(
		private _fb: FormBuilder,
		private http: HttpClient,
		private mediaUploader: MediaUploaderService,
		@Inject(MAT_DIALOG_DATA) public inputData: any,
		public dialogRef: MatDialogRef<ClassContentVideoComponent>,
		private requestHeaderService: RequestHeaderService,
		private contentService: ContentService,
		private matSnackBar: MatSnackBar,
		private renderer: Renderer2
	) {
		this.envVariable = environment;
		this.itenaryForm = inputData.itenaryForm;
		this.lastIndex = inputData.index;
		this.isEdit = inputData.isEdit;
		const contentsFArray = <FormArray>this.itenaryForm.controls['contents'];
		this.contentForm = <FormGroup>contentsFArray.controls[this.lastIndex];
		this.attachments = this.contentForm.controls['supplementUrls'];
		this.attachments.value.forEach(file => {
			this.contentService.getMediaObject(file).subscribe((res: any) => {
				this.attachmentUrls.push(res[0]);
			});
		});
		if (this.contentForm.controls['imageUrl'] && this.contentForm.controls['imageUrl'].value) {
			this.getSignedUrlForVideoStreaming(this.contentForm.controls['imageUrl'].value, this.contentForm.controls['imageUrl'].value.split('/')[this.contentForm.controls['imageUrl'].value.split('/').length - 1]);
		}
	}
	
	ngAfterViewInit() {
		this.getIFRAME();
	}
	
	ngOnInit(): void {
		const content = <FormArray>this.itenaryForm.controls.contents;
		this.lastIndex = this.lastIndex !== -1 ? this.lastIndex : content.controls.length - 1;
		this.resultData['data'] = this.lastIndex;
		this.youtubeEmbed = false;
		this.youtubeEmbed = this.itenaryForm.value.contents[this.lastIndex].youtubeId && this.itenaryForm.value.contents[this.lastIndex].youtubeId.length > 3;
	}
	
	private setupVideoListeners() {
		this.renderer.listen(this.video, 'loadedmetadata',
			() => {
				console.log('metadata loaded');
				this.onVideoMetadataLoaded();
			}
		);
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
						this.contentForm.controls['videoLength'].patchValue(parseInt(event.target.getDuration(), 10));
					},
					'onStateChange': (event) => {
						console.log(event);
						console.log(event.target.getDuration());
						this.contentForm.controls['videoLength'].patchValue(parseInt(event.target.getDuration(), 10));
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
		const youtubeId = <FormArray>this.contentForm.controls.youtubeId;
		console.log('youtubeId.valueChanges.subscribe');
		youtubeId.valueChanges.subscribe(res => {
			console.log(res);
			this.initYoutube(res);
		});
	}
	
	
	public getSignedUrlForVideoStreaming(secureUrl, uploadedUniqueFileName) {
		this.signedUrlForStreaming = null;
		this.loadingUploadedVideo = true;
		this.mediaUploader
			.getDownloadUrl(uploadedUniqueFileName)
			.subscribe(res => {
				this.signedUrlForStreaming = res;
				this.secureVideoUrl = secureUrl;
				this.contentForm.controls['imageUrl'].patchValue(secureUrl);
				this.video = this.matVideo.getVideoTag();
				this.setupVideoListeners();
			}, err => {
				this.loadingUploadedVideo = false;
				console.log(err);
			});
	}
	
	public loadUploadedVideo(uploadedMediaObject) {
		console.log(uploadedMediaObject);
		const secureUrl = uploadedMediaObject.url;
		const uploadedUniqueFileName = uploadedMediaObject.name;
		this.getSignedUrlForVideoStreaming(secureUrl, uploadedUniqueFileName);
	}
	
	public onVideoMetadataLoaded() {
		this.contentForm.controls['videoLength'].patchValue(this.video.duration);
		this.loadingUploadedVideo = false;
	}
	
	public deleteMedia(fileSecureUrl, fileType) {
		const fileurl = fileSecureUrl;
		fileSecureUrl = _.replace(fileSecureUrl, 'download', 'files');
		this.mediaUploader.delete(fileSecureUrl).pipe(first())
			.subscribe((response: any) => {
				console.log(response);
				if (fileType === 'file') {
					const supplementUrls = <FormArray>this.contentForm.controls.supplementUrls;
					let suppUrl = supplementUrls.value;
					suppUrl = _.remove(suppUrl, function (n) {
						return n !== fileurl;
					});
					this.contentForm.controls['supplementUrls'] = new FormArray([]);
					this.attachmentUrls = [];
					suppUrl.forEach(file => {
						supplementUrls.push(new FormControl(file));
						this.contentService.getMediaObject(file).subscribe((res: any) => {
							this.attachmentUrls.push(res[0]);
						});
					});
				} else if (fileType === 'video') {
					this.signedUrlForStreaming = null;
					if (this.contentForm.controls['id'].value) {
						this.contentService.patchContent(this.contentForm.controls['id'].value, { 'imageUrl': '' }).subscribe(
							res => {
								this.contentForm.controls['imageUrl'].patchValue(this.signedUrlForStreaming);
								this.contentForm.controls['videoLength'].patchValue(0);
								delete this.signedUrlForStreaming;
							}
						);
					}
				}
			});
		
	}
	
	addAttachmentUrl(url: string) {
		console.log('Adding image url: ' + url);
		this.attachments.push(new FormControl(url));
		this.contentService.getMediaObject(url).subscribe((res: any) => {
			this.attachmentUrls.push(res[0]);
		});
	}
	
	resetNewUrls(event) {
		const supplementUrls = <FormArray>this.contentForm.controls.supplementUrls;
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


