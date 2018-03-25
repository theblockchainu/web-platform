import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ConsoleAccountComponent} from '../console-account.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProfileService} from '../../../_services/profile/profile.service';
import {CookieUtilsService} from '../../../_services/cookieUtils/cookie-utils.service';

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
    private _cookieUtilsService: CookieUtilsService
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
              old_password: ['', Validators.requiredTrue],
              new_password: ['', Validators.requiredTrue],
              confirm_password: ['', Validators.requiredTrue]
          }
      );
  }

  public changePassword() {
    this.busyChangePassword = true;
    const passwordData = this.changePasswordForm.value;
    this._profileService.changePassword(this.userId, passwordData.oldPassword, passwordData.newPassword).subscribe((res) => {
      console.log(res);
    });
  }

}
