import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MediaUploaderService } from '../../mediaUploader/media-uploader.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProfileService } from '../../profile/profile.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import { environment } from '../../../../environments/environment';


const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
	selector: 'app-verify-id-dialog',
	templateUrl: './verify-id-dialog.component.html',
	styleUrls: ['./verify-id-dialog.component.scss']
})
export class VerifyIdDialogComponent implements OnInit {
	public uploadingImage = false;
	private idProofImagePending: Boolean;
	public peer: FormGroup;
	public verificationIdUrl: string;
	public fileType;
	public fileName;
	public userId;
	public envVariable;

	constructor(
		private activatedRoute: ActivatedRoute,
		public router: Router,
		private _fb: FormBuilder,
		private http: HttpClient,
		private mediaUploader: MediaUploaderService,
		public _profileService: ProfileService,
		public dialogRef: MatDialogRef<VerifyIdDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public _cookieUtilsService: CookieUtilsService) {
		this.userId = _cookieUtilsService.getValue('userId');
		this.envVariable = environment;
	}

	ngOnInit() {
		this.idProofImagePending = true;
		this.peer = this._fb.group({
			email: ['',
				[Validators.required,
				Validators.pattern(EMAIL_REGEX)]],
			verificationIdUrl: ['', Validators.required]
		});
	}
	continue() {
		console.log('dialog opened');
		this._profileService
			.updatePeer(this.userId, { 'verificationIdUrl': this.peer.controls['verificationIdUrl'].value })
			.subscribe((response: any) => {
				console.log('File Saved Successfully');
			}, (err) => {
				console.log('Error updating Peer: ');
				console.log(err);
			});
		this.dialogRef.close();
	}

	uploadImage(event) {
		// this.peer.controls['email'].setValue(this.email);
		this.uploadingImage = true;
		console.log(event.files);
		for (const file of event.files) {
			this.mediaUploader.upload(file).subscribe((responseObj: any) => {
				this.verificationIdUrl = responseObj.url;
				this.fileName = responseObj['originalFilename'];
				this.fileType = responseObj.type;
				this.peer.controls['verificationIdUrl'].setValue(responseObj.url);
				this.uploadingImage = false;
			});
		}
	}

	deleteFromContainer(url: string, type: string) {
		if (type === 'image' || type === 'file') {
			this._profileService.updatePeer(this.userId, {
				'verificationIdUrl': ''
			}).subscribe((response: any) => {
				this.verificationIdUrl = response.picture_url;
			});
		} else {
			console.log('error');
		}
	}
}

