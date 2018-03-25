import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CollectionService } from '../../collection/collection.service';
import {environment} from '../../../../environments/environment';
@Component({
  selector: 'app-profile-popup-card',
  templateUrl: './profile-popup-card.component.html',
  styleUrls: ['./profile-popup-card.component.scss']
})
export class ProfilePopupCardComponent implements OnInit {

  public userRating: any;
  public ownedCollections = [];
  public envVariable;
  constructor(public dialogRef: MatDialogRef<ProfilePopupCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _collectionService: CollectionService) {
      this.envVariable = environment;
  }

  ngOnInit() {
    console.log(this.data);
    if (this.data.reviewsAboutYou) {
      this.userRating = this._collectionService.calculateRating(this.data.reviewsAboutYou);
    }
    if (this.data.ownedCollections !== undefined) {
        this.ownedCollections = this.data.ownedCollections.filter((collection) =>
            (collection.status === 'active' || collection.status === 'completed') && collection.imageUrls !== undefined);
    }
  }
}

