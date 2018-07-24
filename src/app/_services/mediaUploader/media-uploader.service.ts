import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { RequestHeaderService } from '../requestHeader/request-header.service';

@Injectable()
export class MediaUploaderService {
	public envVariable;

	constructor(
		private http: HttpClient,
		private sanitizer: DomSanitizer,
		private requestHeaderService: RequestHeaderService
	) {
		this.envVariable = environment;
	}

	public upload(file) {
		let type = file;
		if (!file.objectURL) {
			file.objectURL = this.sanitizer.bypassSecurityTrustUrl((window.URL.createObjectURL(file)));
		}
		file.src = file.objectURL.changingThisBreaksApplicationSecurity;
		const formData = new FormData();
		if (file.type.includes('image/')) {
			type = 'image';
		} else if (file.type.includes('video/')) {
			type = 'video';
		} else {
			type = 'file';
		}
		formData.append(type, file, file.name);
		return this.http.post(environment.apiUrl + '/api/media/upload?container=peerbuds-dev1290', formData, this.requestHeaderService.mediaOptions)
			.map((response: any) => response);
	}

	public getUploadURL(file: File) {
		return this.http.post(environment.apiUrl + '/api/media/getUploadUrl', {
			name: file.name,
			ext: file.type.split('/')[1]
		}, this.requestHeaderService.mediaOptions);
	}

	public uploadFile(uploadUrl: string, file: File) {
		const req = new HttpRequest('PUT', uploadUrl, file, {
			reportProgress: true
		});
		return this.http.request(req);
	}

	public uploadMedia(data: any) {
		return this.http.post(environment.apiUrl + '/api/media', data, this.requestHeaderService.options);
	}

	delete(file) {
		return this.http.delete(environment.apiUrl + file, this.requestHeaderService.options);
	}

}
