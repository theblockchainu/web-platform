import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsoleAccountComponent } from '../console-account.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../../_services/profile/profile.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-console-account-security',
  templateUrl: './console-account-security.component.html',
  styleUrls: ['./console-account-security.component.scss']
})
export class ConsoleAccountSecurityComponent implements OnInit {

  public changePasswordForm: FormGroup;
  public busyChangePassword = false;
  public loaded = true;
  public userId;

  constructor(
    public activatedRoute: ActivatedRoute,
    public consoleAccountComponent: ConsoleAccountComponent,
    public _fb: FormBuilder,
    public _profileService: ProfileService,
    private _cookieUtilsService: CookieUtilsService,
    private matSnackBar: MatSnackBar
  ) {
    activatedRoute.pathFromRoot[4].url.subscribe((urlSegment) => {
      console.log(urlSegment[0].path);
      consoleAccountComponent.setActiveTab(urlSegment[0].path);
    });
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.changePasswordForm = this._fb.group(
      {
        old_password: ['', Validators.required],
        new_password: ['', Validators.required],
        confirm_password: ['', Validators.required]
      }
    );
  }

  public changePassword() {
    this.busyChangePassword = true;
    const passwordData = this.changePasswordForm.value;
    console.log(this.userId + ' ' + passwordData.old_password + ' ' + passwordData.new_password);
    if (passwordData.new_password === passwordData.confirm_password) {
      this._profileService.changePassword(this.userId, passwordData.old_password, passwordData.new_password).subscribe((res: any) => {
        this.busyChangePassword = false;
        this.matSnackBar.open('Successfully changed password', 'close', { duration: 3000 });
        console.log(res);
      }, err => {
        this.busyChangePassword = false;
        this.matSnackBar.open('Error in updating password', 'close', { duration: 3000 });
      });
    } else {
      this.busyChangePassword = false;
      this.matSnackBar.open('Passwords do not match', 'close', { duration: 3000 });
    }

  }

}
