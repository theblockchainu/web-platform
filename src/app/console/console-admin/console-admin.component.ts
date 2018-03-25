import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsoleComponent } from '../console.component';
import { CollectionService } from '../../_services/collection/collection.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { MatSnackBar } from '@angular/material';
import {environment} from '../../../environments/environment';

declare var moment: any;


@Component({
  selector: 'app-console-admin',
  templateUrl: './console-admin.component.html',
  styleUrls: ['./console-admin.component.css']
})
export class ConsoleAdminComponent implements OnInit {
  public collectionsLoaded: boolean;
  public unapprovedCollections: Array<any>;
  public unapprovedPeers: Array<any>;
  public peersLoaded: boolean;
  public envVariable;
  constructor(
    activatedRoute: ActivatedRoute,
    consoleComponent: ConsoleComponent,
    public _collectionService: CollectionService,
    public _profileService: ProfileService,
    public snackBar: MatSnackBar,
  ) {
      this.envVariable = environment;
    activatedRoute.pathFromRoot[3].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleComponent.setActiveTab(urlSegment[0].path);
    });
  }

  ngOnInit() {
    this.fetchCollections();
    this.fetchPeers();
  }

  private fetchPeers() {
    this.peersLoaded = false;
    const query = {
      'where': { 'accountVerified': 'false' },
      'include': [
        'profiles'
      ]
    };
    this._profileService.getAllPeers(query).subscribe((result: any) => {
      this.unapprovedPeers = result;
      this.unapprovedPeers.sort((a, b) => {
        return moment(a.updatedAt).diff(moment(b.updatedAt), 'days');
      });
      this.peersLoaded = true;
    }, err => {
      console.log(err);
    });
  }

  private fetchCollections() {
    this.collectionsLoaded = false;
    const query = {
      'where': { 'isApproved': false, 'status': 'submitted' },
      'include': [
        'calendars'
      ]
    };
    this._collectionService.getAllCollections(query).subscribe(
      (result: any) => {
        this.unapprovedCollections = result;
        this.unapprovedCollections.sort((a, b) => {
          return moment(a.updatedAt).diff(moment(b.updatedAt), 'days');
        });
        this.collectionsLoaded = true;
      }, err => {
        console.log(err);
      }
    );
  }

  public approveWorkshop(collection: any) {

    this._collectionService.approveCollection(collection).subscribe(
      (result: any) => {
        if (result) {
          this.fetchCollections();
          this.snackBar.open(result.result, 'Close', {
            duration: 800
          }).onAction().subscribe();
        }
      }, err => {
        console.log(err);
      }
    );
  }

  /**
   * approvePeer
   */
  public approvePeer(peer) {
    this._profileService.approvePeer(peer).subscribe((result: any) => {
      if (result) {
        this.fetchPeers();
        this.snackBar.open(result.result, 'Close', {
          duration: 800
        }).onAction().subscribe();
      }

    }, err => {
      console.log(err);
    });
  }

}
