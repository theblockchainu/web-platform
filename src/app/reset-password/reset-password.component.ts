import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertService } from '../_services/alert/alert.service';
import { AuthenticationService } from '../_services/authentication/authentication.service';
import { Observable } from 'rxjs/Observable';
import {
  FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators
} from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { DialogsService } from '../_services/dialogs/dialog.service';


@Component({
  selector: 'app-reset-pwd',  // <login></login>
  providers: [],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: ['./reset-password.component.scss'],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  // Set our default values
  // public loading = false;
  isLoggedIn: Observable<boolean>;
  public password: string;
  public confirmPassword: string;
  public email: string;
  public resetpwdForm: FormGroup;
  private verificationToken: string;
  // TypeScript public modifiers

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public authenticationService: AuthenticationService,
    private alertService: AlertService,
    private _fb: FormBuilder,
    private snackBar: MatSnackBar,
    private _dialogsService: DialogsService
  ) {
    this.isLoggedIn = this.authenticationService.isLoggedIn();
    this.email = this.route.queryParams['value'].email;
    this.verificationToken = this.route.queryParams['value'].code;
    console.log(this.email + ' ' + this.verificationToken);
  }

  public ngOnInit() {
    // get return url from route parameters or default to '/'

    this.resetpwdForm = this._fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  public resetpwd() {
    // this.loading = true;
    this.password = this.resetpwdForm.controls['password'].value;
    this.confirmPassword = this.resetpwdForm.controls['confirmPassword'].value;
    const body = {
      'email': this.email,
      'password': this.resetpwdForm.controls['password'].value,
      'verificationToken': this.verificationToken
    };
    this.authenticationService.resetPassword(body)
      .subscribe(
        (data) => {
          if (data.success) {
            this.snackBar.open(data.message + ', redirecting...', 'Ok', {
              duration: 800
            });
            this.router.navigateByUrl('');
          } else {
            this.snackBar.open(data.message, 'close', {
              duration: 800
            });
          }
        },
        (error) => {
          console.log(error);
          this.snackBar.open(error.error.message, 'Resend Email').onAction().subscribe(res => {
            this._dialogsService.openForgotPassword(this.email).afterClosed().subscribe(data => {
              this.router.navigateByUrl('');
            });
          });
        });
  }
}
