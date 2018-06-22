import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { AccreditationService } from '../../_services/accreditation/accreditation.service';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material';
import { ProfileService } from '../../_services/profile/profile.service';
import { CollectionService } from '../../_services/collection/collection.service';
import { Title, Meta } from '@angular/platform-browser';
import { UcWordsPipe } from 'ngx-pipes';

declare var FB: any;

@Component({
  selector: 'app-accreditation-page',
  templateUrl: './accreditation-page.component.html',
  styleUrls: ['./accreditation-page.component.scss']
})
export class AccreditationPageComponent implements OnInit {
  loadingAccreditation: boolean;
  accreditation: any;
  accreditationId: string;
  userId: string;
  initialised: boolean;
  joined: boolean;
  isOwner: boolean;
  isEligible: boolean;
  eligibilityReason: string;
  userGyan: number;
  accountApproved: string;
  envVariable: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _cookieUtilsService: CookieUtilsService,
    private _accreditationService: AccreditationService,
    private router: Router,
    private dialogsService: DialogsService,
    private matSnackBar: MatSnackBar,
    private profileService: ProfileService,
    public collectionService: CollectionService,
    private titleService: Title,
    private metaService: Meta,
    private ucwords: UcWordsPipe
  ) {
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      if (this.initialised && (this.accreditationId !== params['accreditationId'])) {
        location.reload();
      }
      this.accreditationId = params['accreditationId'];
    });
    this.userId = this._cookieUtilsService.getValue('userId');
    this.initialised = true;
    this.initializePage();
    this.accountApproved = this._cookieUtilsService.getValue('accountApproved');
    this.envVariable = environment;
  }

  initializePage() {
    this.initialised = false;
    this.joined = false;
    this.isOwner = false;
    this.isEligible = false;
    const filter = {
      'include': [
        { 'createdBy': 'profiles' },
        { 'subscribedBy': 'profiles' },
        'topics']
    };
    this._accreditationService.fetchAccreditation(this.accreditationId, filter)
      .subscribe((res: any) => {
        this.accreditation = res;
        console.log(this.accreditation);
        this.setTags();
        for (let index = 0; (!this.joined && !this.isOwner && index < this.accreditation.subscribedBy.length); index++) {
          const peer = this.accreditation.subscribedBy[index];
          if (peer.id === this.userId) {
            this.joined = true;
          }
        }
        if (!this.joined) {
          this.checkEligibility();
        }
      });
  }

  checkEligibility() {
    this.isEligible = false;
    if (this.userId === undefined || this.userId.length <= 5) {
      this.eligibilityReason = 'Create an account now to join this accreditation';
      return;
    }
    if (!this.accountApproved) {
      this.eligibilityReason = 'Your account is not approved';
      return;
    }
    if (this.accreditation.createdBy[0].id === this.userId) {
      this.isOwner = true;
      this.eligibilityReason = 'You are the owner';
      return;
    }
    this.profileService.getGyanBalance(this.userId, 'fixed').subscribe(res => {
      this.userGyan = res;
      this.userGyan = 10;
      if (this.userGyan < this.accreditation.minimum_gyan) {
        this.eligibilityReason = 'Your gyan value ' + this.userGyan
          + ' is lower than than the minimum gyan '
          + this.accreditation.minimum_gyan + ' required for joining the accreditation';
      } else {
        const query = { 'include': 'accreditationsSubscribed' };
        console.log('querying for peerdata');
        this.profileService.getPeerData(this.userId, query).subscribe(result => {
          if (result.accreditationsSubscribed && result.accreditationsSubscribed.length > 0) {
            let totalSalaryShare = 0;
            result.accreditationsSubscribed.forEach(accreditation => {
              totalSalaryShare += accreditation.fees;
            });
            console.log('total share = ' + totalSalaryShare);
            if (totalSalaryShare + Number(this.accreditation.fees) >= 100) {
              this.eligibilityReason = 'Join Accreditation?';
            } else {
              this.isEligible = true;
            }
          } else {
            this.isEligible = true;
          }
        });
      }
    });
  }

  openCollection(collection: any) {
    this.router.navigateByUrl('/' + collection.type + '/' + collection.id);
  }


  public joinAccreditation() {
    this._accreditationService.joinAccreditation(this.userId, this.accreditationId).subscribe(res => {
      console.log(res);
      this.matSnackBar.open('Joined Accreditation', 'Close', { duration: 600 });
      this.initializePage();
    });
  }

  public openInviteFriendsDialog() {
    const shareObject = this.accreditation;
    shareObject.type = 'accreditation';
    this.dialogsService.inviteFriends(shareObject);
  }


  public shareOnFb() {
    FB.ui({
      method: 'share_open_graph',
      action_type: 'og.shares',
      action_properties: JSON.stringify({
        object: {
          'og:url': environment.clientUrl + this.router.url, // your url to share
          'og:title': this.accreditation.title,
          'og:site_name': 'Peerbuds',
          'og:description': this.accreditation.description
        }
      })
    }, function (response) {
      console.log('response is ', response);
    });
  }

  removeSubscriber(subscriberId: string) {
    this._accreditationService.leaveAccreditation(subscriberId, this.accreditationId).subscribe(res => {
      this.matSnackBar.open('Removed from Accreditation', 'Close', { duration: 3000 });
      this.initializePage();
    });
  }

  leaveAccreditation() {
    this._accreditationService.leaveAccreditation(this.userId, this.accreditationId).subscribe(res => {
      this.matSnackBar.open('Left Accreditation', 'Close', { duration: 3000 });
      this.initializePage();
    });
  }

  private setTags() {
    this.titleService.setTitle(this.ucwords.transform('Accreditation: ' + this.accreditation.title));
    this.metaService.updateTag({
      property: 'og:title',
      content: this.accreditation.title
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: this.accreditation.description
    });
    this.metaService.updateTag({
      property: 'og:site_name',
      content: 'peerbuds.com'
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: environment.clientUrl + this.router.url
    });
  }

}
