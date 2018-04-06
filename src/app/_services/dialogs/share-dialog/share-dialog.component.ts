import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import {environment} from '../../../../environments/environment';
declare var FB: any;


@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss']
})
export class ShareDialogComponent implements OnInit {

  public generatedUrl: string;
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
    this.tweetUrl = 'https://twitter.com/intent/tweet?text=Join me for the ' + this.data.type + ' ' + this.data.title + '&url=' + this.generatedUrl;
    this.LinkedInShareUrl = 'https://www.linkedin.com/shareArticle?mini=true&url=' + this.generatedUrl + '&title=' + this.data.title + '&summary=Join me for the ' + this.data.type + ' ' + this.data.title + ' on ' + this.generatedUrl;
  }

  ngOnInit() {
  }

  public onCopySuccess() {
    this.snackBar.open('Copied to clipboard', 'Close', {
      duration: 5000
    });
  }

  public onEmailClicked() {
    window.location.href = 'mailto:' + '' + '?Subject=Want to join me for this ' + this.data.type + '?&body=Hey, I found this really fitting ' + this.data.type + ' ' + this.data.title + ' you should look at - ' + this.generatedUrl;
  }

  public onFBClicked() {
    FB.ui({
      method: 'share',
      display: 'popup',
      href: this.generatedUrl,
    }, function (response) { });
  }

  public onLinkedInClicked() {
    window.open(this.LinkedInShareUrl, 'MyWindow', 'width = 600, height = 300'); return false;
  }

}
