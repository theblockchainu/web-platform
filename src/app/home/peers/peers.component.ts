import { Component, OnInit, ViewChild } from '@angular/core';
import { CollectionService } from '../../_services/collection/collection.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import { MatDialog } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-peers',
  templateUrl: './peers.component.html',
  styleUrls: ['./peers.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ]
})
export class PeersComponent implements OnInit {
  public peers: Array<any>;
  public availableTopics: Array<any>;
  public userId;
  public loading = false;
  public envVariable;

  @ViewChild('topicButton') topicButton;
  @ViewChild('priceButton') priceButton;
  constructor(
    public _collectionService: CollectionService,
    public _profileService: ProfileService,
    private _cookieUtilsService: CookieUtilsService,
    public dialog: MatDialog
  ) {
      this.envVariable = environment;
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.fetchPeers();
  }

  fetchPeers() {
    const query = {
      'include': [
        'reviewsAboutYou',
        'profiles'
      ],
      'limit': 50
    };
    this.loading = true;
    this._profileService.getAllPeers(query).subscribe((result: any) => {
      this.loading = false;
      this.peers = [];
      for (const responseObj of result) {
        if (responseObj.id !== this.userId) {
          responseObj.rating = this._collectionService.calculateRating(responseObj.reviewsAboutYou);
          this.peers.push(responseObj);
        }
      }
    }, (err) => {
      console.log(err);
    });
  }
}
