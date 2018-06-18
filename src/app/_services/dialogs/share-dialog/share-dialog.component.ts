import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { environment } from '../../../../environments/environment';
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
				private snackBar: MatSnackBar) {
		this.envVariable = environment;
		if (data.cohortId) {
			this.generatedUrl = environment.clientUrl + '/' + data.type + '/' + data.id + '/calendar/' + data.cohortId;
		} else {
			this.generatedUrl = environment.clientUrl + '/' + data.type + '/' + data.id;
		}
		this.generatedTitle = data.title;
		this.generatedDescription = data.description;
		this.generatedImage = data.image;
		if (data.type === 'story') {
			this.tweetUrl = 'https://twitter.com/intent/tweet?text=See my knowledge story&url=' + this.generatedUrl;
			this.LinkedInShareUrl = 'https://www.linkedin.com/shareArticle?mini=true&url=' + this.generatedUrl + '&title=Knowledge Story&summary=See my knowledge story on ' + this.generatedUrl;
		} else {
			this.tweetUrl = 'https://twitter.com/intent/tweet?text=Join me for the ' + this.data.type + ', ' + this.data.title + '&url=' + this.generatedUrl;
			this.LinkedInShareUrl = 'https://www.linkedin.com/shareArticle?mini=true&url=' + this.generatedUrl + '&title=Join me for the ' + this.data.type + ', ' + this.data.title + '&summary=' + this.data.description + '&source=Peerbuds';
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
		} else {
			window.location.href = 'mailto:' + '' + '?Subject=Want to join me for this ' + this.data.type + '?&body=Hey, I found this really fitting ' + this.data.type + ' ' + this.data.title + ' you should look at - ' + this.generatedUrl;
		}
	}
	
	public onFBClicked() {
		FB.ui({
			method: 'share_open_graph',
			action_type: 'og.shares',
			action_properties: JSON.stringify({
				object: {
					'og:url': this.generatedUrl, // your url to share
					'og:title': (this.data.type === 'story') ? 'Knowledge story of ' + this.data.title : 'Join me for the ' + this.data.type + ', ' + this.data.title,
					'og:site_name': 'Peerbuds',
					'og:image': this.data.image,
					'og:description': (this.data.type === 'story') ? 'View my knowledge story at ' + this.generatedUrl : this.data.description,
				}
			})
		}, function (response) {
			console.log('response is ', response);
		});
	}
	
	public onLinkedInClicked() {
		window.open(this.LinkedInShareUrl, 'MyWindow', 'width = 600, height = 300'); return false;
	}
	
}
