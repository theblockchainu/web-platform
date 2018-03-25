import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleProfileComponent } from '../console-profile.component';
import { ProfileService } from '../../../_services/profile/profile.service';
import { MediaUploaderService } from '../../../_services/mediaUploader/media-uploader.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import {environment} from '../../../../environments/environment';

declare var moment: any;

@Component({
  selector: 'app-console-profile-photos',
  templateUrl: './console-profile-photos.component.html',
  styleUrls: ['./console-profile-photos.component.scss']
})
export class ConsoleProfilePhotosComponent implements OnInit {
  public picture_url: string;
  public userId;
  public profile_picture_array = [];
  public profile_video: string;
  private uploadingImage = false;
  private uploadingVideo = false;
  public loadingMediaPage = false;
  public envVariable;
  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleProfileComponent: ConsoleProfileComponent,
    public router: Router,
    public _profileService: ProfileService,
    public mediaUploader: MediaUploaderService,
    private _cookieUtilsService: CookieUtilsService
  ) {
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleProfileComponent.setActiveTab(urlSegment[0].path);
    });
    this.envVariable = environment;
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.loadingMediaPage = true;
    this._profileService.getProfile(this.userId).subscribe((profiles) => {
      this.picture_url = profiles[0].picture_url;
      this.profile_video = profiles[0].profile_video;
      this.loadingMediaPage = false;
    });

  }

  uploadVideo(event) {
    this.uploadingVideo = true;
    for (const file of event.files) {
      this.mediaUploader.upload(file).subscribe((response) => {
        this.profile_video = response.url;
        this._profileService.updateProfile(this.userId, {
          'profile_video': response.url
        }).subscribe((res: any) => {
          this.profile_video = res.profile_video;
          this.uploadingVideo = false;
        }, err => {
          console.log(err);
        });
      }, err => {
        console.log(err);
      });
    }
  }

  uploadImage(event) {
    this.uploadingImage = true;
    for (const file of event.files) {
      this.mediaUploader.upload(file).subscribe((response) => {
        this.picture_url = response.url;
        this._profileService.updateProfile(this.userId, {
          'picture_url': response.url
        }).subscribe((res: any) => {
          this.picture_url = res.picture_url;
          this.uploadingImage = false;
        }, err => {
          console.log(err);
        });
        // this.profile_picture_array.push(response.url);
      }, err => {
        console.log(err);
      });
    }
  }

  setProfilePic(image, type) {
    this._profileService.updateProfile(this.userId, {
      'picture_url': image
    }).subscribe(response => {
      this.picture_url = response.url;
    }, err => {
      console.log(err);
    });
  }


  deleteFromContainerArr(event) {
    console.log(event);
  }

  deleteFromContainer(url: string, type: string) {
    if (type === 'image') {
      this._profileService.updateProfile(this.userId, {
        'picture_url': ''
      }).subscribe(response => {
        this.picture_url = response.picture_url;
      });
    } else if (type === 'video') {
      this._profileService.updateProfile(this.userId, {
        'profile_video': ''
      }).subscribe(response => {
        this.profile_video = response.profile_video;
      });
    } else {
      console.log('error');

    }
  }

}
