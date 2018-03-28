import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleProfileComponent } from '../console-profile.component';
import { ProfileService } from '../../../_services/profile/profile.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { DialogsService } from '../../../_services/dialogs/dialog.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { ContentService } from '../../../_services/content/content.service';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-console-profile-verification',
  templateUrl: './console-profile-verification.component.html',
  styleUrls: ['./console-profile-verification.component.scss']
})
export class ConsoleProfileVerificationComponent implements OnInit {

  public userId;
  public loading = false;
  public profile: any;
  public alreadyVerified: Array<any>;
  public notVerified: Array<any>;
  private queryForSocialIdentities = { 'include': [{profiles : 'phone_numbers'}, 'identities', 'credentials'] };
  public socialIdentitiesConnected: any = [];
  public boolShowConnectedSocials = false;
  public envVariable;
  public connectedIdentities = {
    'fb': false,
    'google': false
  };

  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleProfileComponent: ConsoleProfileComponent,
    public router: Router,
    private dialog: MatDialog,
    private dialogsService: DialogsService,
    public _profileService: ProfileService,
    private _cookieUtilsService: CookieUtilsService,
    private contentService: ContentService
  ) {
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleProfileComponent.setActiveTab(urlSegment[0].path);
    });
      this.envVariable = environment;
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.loading = true;
    this.getProfile();
  }

  public openIdVerify() {
    this.dialogsService.openIdVerify().subscribe(res => {
      this.getProfile();
    });
  }

  public openEmailVerify() {
    this.dialogsService.openEmailVerify().subscribe(res => {
      this.getProfile();
    });
  }

  public openPhoneVerify() {
    this.dialogsService.openPhoneVerify().subscribe(res => {
      this.getProfile();
    });
  }

  private getProfile() {
    this._profileService.getPeerData(this.userId, this.queryForSocialIdentities).subscribe((peer) => {
      this.alreadyVerified = [];
      this.notVerified = [];
      if (peer.phoneVerified && peer.profiles[0].phone_numbers && peer.profiles[0].phone_numbers.length > 0) {
        this.alreadyVerified.push({
          text: 'Phone Number',
          value: '+' + peer.profiles[0].phone_numbers[0].country_code + ' ' +  peer.profiles[0].phone_numbers[0].subscriber_number
        });
      } else {
        if (peer.profiles[0].phone_numbers && peer.profiles[0].phone_numbers.length > 0) {
          this.notVerified.push({
            text: 'Phone Number',
            value: '+' + peer.profiles[0].phone_numbers[0].country_code + ' ' +  peer.profiles[0].phone_numbers[0].subscriber_number
          });
        } else {
          this.notVerified.push({
            text: 'Phone Number',
            value: ''
          });
        }
      }
      if (peer.emailVerified && peer.email) {
        this.alreadyVerified.push({
          text: 'Email address',
          value: peer.email
        });
      } else {
        if (peer.email) {
          this.notVerified.push({
            text: 'Email address',
            value: peer.email
          });
        } else {
          this.notVerified.push({
            text: 'Email address',
            value: ''
          });
        }
      }
      if (peer.accountVerified && peer.verificationIdUrl) {
        this.contentService.getMediaObject(peer.verificationIdUrl).subscribe((res) => {
          this.alreadyVerified.push({
            text: 'Government Id',
            value: res[0]
          });
        });

      } else {
        if (peer.verificationIdUrl && peer.verificationIdUrl.length > 5) {
          this.contentService.getMediaObject(peer.verificationIdUrl).subscribe((res) => {
            this.notVerified.push({
              text: 'Government Id',
              value: res[0],
              submitted: true
            });
          });

        } else {
          this.notVerified.push({
            text: 'Government Id',
            value: 'A Government ID is required for us to make sure you are legit.'
          });
        }
      }
      this.socialIdentitiesConnected = peer;
      // this.socialIdentitiesConnected.forEach(socialIdentity => {
      if (this.socialIdentitiesConnected.identities.length > 0) {
        this.socialIdentitiesConnected.identities.forEach(element => {
          if (element.provider === 'google') {
            this.connectedIdentities.google = true;
          } else if (element.provider === 'facebook') {
            this.connectedIdentities.fb = true;
          }
        });
      }
      if (this.socialIdentitiesConnected.credentials.length > 0) {
        this.socialIdentitiesConnected.credentials.forEach(element => {
          if (element.provider === 'google') {
            this.connectedIdentities.google = true;
          } else if (element.provider === 'facebook') {
            this.connectedIdentities.fb = true;
          }
        });
      }
      this.loading = false;
    });
  }

}
