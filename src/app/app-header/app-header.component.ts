import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationService } from '../_services/authentication/authentication.service';
import { Observable } from 'rxjs/Observable';
import { RequestHeaderService } from '../_services/requestHeader/request-header.service';
import { ProfileService } from '../_services/profile/profile.service';
import { FormControl } from '@angular/forms';
import {environment} from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DialogsService } from '../_services/dialogs/dialog.service';
import { AppNotificationDialogComponent } from './dialogs/app-notification-dialog/app-notification-dialog.component';
import { NotificationService } from '../_services/notification/notification.service';
import { SearchService } from '../_services/search/search.service';
import { CookieUtilsService } from '../_services/cookieUtils/cookie-utils.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AppHeaderComponent implements OnInit {
  isLoggedIn: Observable<boolean>;
  loggedIn: boolean;
  public hasNewNotification = false;
  public profile: any;
  public userType = '';
  public myControl = new FormControl('');
  @ViewChild('notificationsButton') notificationsButton;
  public userId;
  public userIdObservable;
  public envVariable;
  private key = 'userId';
  public options: any[];
  public defaultProfileUrl = '/assets/images/default-user.jpg';
  public isTeacher = false;
  public makeOldNotification = [];
  public profileCompletionObject: any;
  constructor(public authService: AuthenticationService,
    private http: HttpClient,
    private _cookieService: CookieUtilsService,
    public _profileService: ProfileService,
    private router: Router,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private _notificationService: NotificationService,
    public _searchService: SearchService,
    private dialogsService: DialogsService) {
      this.envVariable = environment;
    this.profile = {};
    this.isLoggedIn = authService.isLoginSubject.asObservable();
    authService.isLoggedIn().subscribe((res) => {
      this.loggedIn = res;
    });

    authService.getLoggedInUser.subscribe((userId) => {
      if (userId !== 0) {
        this.userId = userId;
        this.getProfile();
        this.getNotifications();
      } else {
        this.loggedIn = false;
        this.profile = {};
      }
    });
    this.userId = this.userIdObservable || this._cookieService.getValue('userId');

  }

  ngOnInit() {
    this._profileService.profileSubject.subscribe(res => {
      this.getProfile();
    });
    this.getProfile();
    this.getNotifications();
    this.myControl.valueChanges.subscribe((value) => {
      this._searchService.getAllSearchResults(this.userId, value, (err, result) => {
        if (!err) {
          this.options = result;
        } else {
          console.log(err);
        }
      });
    });
  }

  getProfile() {
    if (this.loggedIn) {
      this._profileService.getCompactProfile(this.userId).subscribe(profile => {
        if (profile && profile.length > 0) {
          this.profile = profile[0];
          if (this.profile.peer[0].ownedCollections !== undefined && this.profile.peer[0].ownedCollections.length > 0) {
            this.isTeacher = true;
          }
          this.profileCompletionObject = this._profileService.getProfileProgressObject(this.profile);
          console.log(this.profileCompletionObject);
        }
      });
    } else {
      return null;
    }
  }

  public openSignup() {
    this.dialogsService.openSignup().subscribe();
  }


  public openLogin() {
    console.log('openLogin');
    this.dialogsService.openLogin().subscribe();
  }

  public goToHome() {
    if (this.loggedIn) {
      this.router.navigate(['home', 'homefeed']);
    } else {
      this.router.navigate(['/']);
    }
  }

  public getNotifications() {
    this._notificationService.getNotifications(this.userId, '{}', (err, result) => {
      if (err) {
        console.log(err);
      } else {
        result.forEach(resultItem => {
          if (resultItem.new) {
            this.hasNewNotification = true;
            resultItem.new = false;
            resultItem.seen = true;
            delete resultItem.createdAt;
            delete resultItem.updatedAt;
            this.makeOldNotification.push(resultItem);
          }
        });
      }
    });
  }

  openNotificationsDialog(): void {
    const dialogRef = this.dialog.open(AppNotificationDialogComponent, {
      width: '350px',
      height: '70vh',
      data: {
      },
      disableClose: false,
      position: {
        top: this.notificationsButton._elementRef.nativeElement.getBoundingClientRect().bottom + 8 + 'px',
        left: this.notificationsButton._elementRef.nativeElement.getBoundingClientRect().left - 220 + 'px'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (this.makeOldNotification.length > 0) {
        this.makeOldNotification.forEach(notifItem => {
          this._notificationService.updateNotification(this.userId, notifItem, (err, patchResult) => {
            if (err) {
              console.log(err);
            }
          });
        });
        this.hasNewNotification = false;
      }
    });
  }
}
