import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { flatMap } from 'rxjs/operators';
@Component({
	selector: 'app-upload-file',
	templateUrl: './upload-file.component.html',
	styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent implements OnInit {
	
	public uploadingFile: boolean;
	public uploadProgress: number;
	
	@Output() uploaded = new EventEmitter<any>();
	
	constructor(
		private mediaUploader: MediaUploaderService
	) { }
	
	ngOnInit() {
	}
	
	upload(event) {
		this.uploadingFile = true;
		for (const file of event.files) {
			let container;
			let name;
			let downloadUrl;
			this.mediaUploader.getUploadURL(file).pipe(
				flatMap(
					(res: any) => {
						console.log(res);
						container = res.container;
						name = res.fileName;
						downloadUrl = res.url;
						return this.mediaUploader.uploadFile(res.uploadUrl, file);
					}
				)
			).subscribe((response: any) => {
				if (response.type === HttpEventType.UploadProgress) {
					// This is an upload progress event. Compute and show the % done:
					const percentDone = Math.round(100 * response.loaded / response.total);
					this.uploadProgress = percentDone;
					// console.log(`File is ${percentDone}% uploaded.`);
				} else if (response instanceof HttpResponse) {
					console.log(response);
					console.log('File is completely uploaded!');
					const mediaBody = {
						originalFilename: file.name,
						size: file.size,
						name: name,
						type: file.type,
						container: container,
						url: downloadUrl
					};
					this.mediaUploader.uploadMedia(mediaBody).subscribe((res: any) => {
						this.uploaded.next(res.url);
						this.uploadingFile = false;
					});
				}
			}, err => {
				console.log(err);
				this.uploadingFile = false;
			});
		}
	}
	
}
