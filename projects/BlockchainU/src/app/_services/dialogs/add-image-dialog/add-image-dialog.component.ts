import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';
import { CollectionService } from '../../collection/collection.service';
import { environment } from '../../../../environments/environment';
import { MatDialogRef } from '@angular/material';
@Component({
  selector: 'app-add-image-dialog',
  templateUrl: './add-image-dialog.component.html',
  styleUrls: ['./add-image-dialog.component.scss']
})
export class AddImageDialogComponent implements OnInit {

  private userId: string;
  public medias: Array<any>;
  public envVariable: any;
  public loadingMedias: boolean;
  constructor(
    private profileService: ProfileService,
    private cookieUtilsService: CookieUtilsService,
    public _collectionService: CollectionService,
    private dialogRef: MatDialogRef<AddImageDialogComponent>,
  ) {
    this.envVariable = environment;
  }

  ngOnInit() {
    this.userId = this.cookieUtilsService.getValue('userId');
    this.getMedias();
  }

  getMedias() {
    this.loadingMedias = true;
    this.profileService.getMedias(this.userId).subscribe((res: any) => {
      console.log(res);
      this.medias = res;
      this.loadingMedias = false;
    }, err => {
      this.loadingMedias = false;
    });
  }

  public addAttachmentUrl(url: string) {
    console.log(url);
    this.dialogRef.close(environment.apiUrl + url);
    // this.getMedias();
  }

  public selectImage(imageUrl: string) {
    this.dialogRef.close(environment.apiUrl + imageUrl);
  }

}
