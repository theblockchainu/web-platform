import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { environment } from '../../../../environments/environment';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
declare var FB: any;


@Component({
	selector: 'app-share-dialog',
	templateUrl: './share-dialog.component.html',
	styleUrls: ['./share-dialog.component.scss']
})
export class ShareDialogComponent implements OnInit {

	public generatedUrl: string;
	public generatedTitle: string;
	public generatedDescription: string;
	public generatedImage: string;
	public tweetUrl: string;
	public envVariable;
	public LinkedInShareUrl: string;
	constructor(public dialogRef: MatDialogRef<ShareDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private snackBar: MatSnackBar,
		private cookieUtilsService: CookieUtilsService) {
		const userId = cookieUtilsService.getValue('userId');
		this.envVariable = environment;
		this.generatedUrl = environment.clientUrl + '/' + data.type + '/' + data.customUrl;
		if (data.cohortId) {
			this.generatedUrl = this.generatedUrl + '/calendar/' + data.cohortId;
		}
		if (data.isTeacher) {
			this.generatedUrl = this.generatedUrl + '?referredBy=' + userId;
		}
		this.generatedTitle = data.title;
		this.generatedDescription = data.description;
		this.generatedImage = data.image;
		if (data.type === 'story') {
			this.tweetUrl = 'https://twitter.com/intent/tweet?text=See my knowledge story&url=' + this.generatedUrl;
			this.LinkedInShareUrl = 'https://www.linkedin.com/shareArticle?mini=true&url=' + this.generatedUrl + '&title=Knowledge Story&summary=See my knowledge story on ' + this.generatedUrl;
		} else if (data.type === 'certificate') {
			this.tweetUrl = 'https://twitter.com/intent/tweet?text=Take a look at my certificate for ' + this.data.title + '&url=' + this.generatedUrl;
			this.LinkedInShareUrl = 'https://www.linkedin.com/shareArticle?mini=true&url=' + this.generatedUrl + '&title=Take a look at my certificate for ' + this.data.title + '&source=The Blockchain University';
		} else {
			this.tweetUrl = 'https://twitter.com/intent/tweet?text=Join me for ' + this.data.title + '&url=' + this.generatedUrl;
			this.LinkedInShareUrl = 'https://www.linkedin.com/shareArticle?mini=true&url=' + this.generatedUrl + '&title=Join me for ' + this.data.title + '&summary=' + this.data.headline + '&source=The Blockchain University';
		}
	}

	ngOnInit() {
	}

	public onCopySuccess() {
		this.snackBar.open('Copied to clipboard', 'Close', {
			duration: 5000
		});
	}

	public onEmailClicked() {
		if (this.data.type === 'story') {
			window.location.href = 'mailto:' + '' + '?Subject=See my knowledge story?&body=Hey, you can view my knowledge story at - ' + this.generatedUrl;
		} else if (this.data.type === 'certificate') {
			window.location.href = 'mailto:' + '' + '?Subject=Take a look at my certificate?&body=Hey, Take a look at my certificate for ' + this.data.title + ' you should look at - ' + this.generatedUrl;
		} else {
			window.location.href = 'mailto:' + '' + '?Subject=Want to join me for this ' + this.data.type + '?&body=Hey, I found this really fitting ' + this.data.type + ' ' + this.data.title + ' you should look at - ' + this.generatedUrl;
		}
	}

	public onFBClicked() {
		let title = '';
		let description = '';
		if (this.data.type === 'story') {
			title = this.data.title + '\'s Knowledge Story';
			description = 'View my knowledge story at ' + this.generatedUrl;
		} else if (this.data.type === 'certificate') {
			title = 'Smart Certificate for ' + this.data.title;
			description = 'Smart Certificates are instantly verifiable and backed by blockchain technology.';
		} else {
			title = 'Join me for ' + this.data.title;
			description = this.data.headline;
		}
		FB.ui({
			method: 'share_open_graph',
			action_type: 'og.shares',
			action_properties: JSON.stringify({
				object: {
					'og:url': this.generatedUrl, // your url to share
					'og:title': title,
					'og:site_name': 'The Blockchain University',
					'og:image': this.data.image,
					'og:description': description,
				}
			})
		}, function (response) {
			console.log('response is ', response);
		});
	}

	public onLinkedInClicked() {
		window.open(this.LinkedInShareUrl, 'MyWindow', 'width = 600, height = 400'); return false;
	}

}
