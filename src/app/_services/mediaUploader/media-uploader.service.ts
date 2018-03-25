import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import {environment} from '../../../environments/environment';

@Injectable()
export class MediaUploaderService {
  private options;
  public envVariable;

  constructor(private http: HttpClient,
    private sanitizer: DomSanitizer) { this.envVariable = environment; }

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
    return this.http.post(environment.apiUrl + '/api/media/upload?container=peerbuds-dev1290',
      formData,
      { withCredentials: true })
      .map((response: any) => response);
  }

}
