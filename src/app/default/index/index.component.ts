import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { NgModule } from '@angular/core';
import { MatDialogRef, MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators } from '@angular/forms';

import { LoginComponentDialog } from '../../_services/dialogs/login-dialog/login-dialog.component';
import {
  MatButtonModule, MatCardModule, MatMenuModule, MatToolbarModule,
  MatIconModule, MatAutocompleteModule, MatInputModule, MatNativeDateModule,
  MatProgressSpinnerModule, MatProgressBarModule
} from '@angular/material';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { AppHeaderComponent } from '../../app-header/app-header.component';
import { DialogsService } from '../../_services/dialogs/dialog.service';
// import { DefaultComponent } from '../default.component';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  public loadingHome = false;
  private email: string;
  notifyForm: FormGroup;
  public isLoggedIn;
  public loggedIn = false;
  constructor(
    private authenticationService: AuthenticationService,
    public _fb: FormBuilder,
    private _router: Router,
    public dialog: MatDialog,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    private dialogsService: DialogsService,
    private _activatedRoute: ActivatedRoute) {
    this.isLoggedIn = authenticationService.isLoggedIn();
    authenticationService.isLoggedIn().subscribe((res) => {
      this.loggedIn = res;
      if (this.loggedIn) {
        this._router.navigate(['home', 'homefeed']);
      }
    });
    // _activatedRoute.url.subscribe(res => {
    //   if (res[0] && res[0].path === 'login') {
    //     if (!this.loggedIn) {
    //       this.dialogsService.openLogin().subscribe();
    //     } else {
    //       // this._router.navigate(['home', 'homefeed']);
    //     }
    //   }
    // });
  }
  ngOnInit() {
    this.loadingHome = false;
    this.notifyForm = this._fb.group(
      { email: ['', Validators.requiredTrue] }
    );
  }
  public openVideo() {
    const url = 'http://static.videogular.com/assets/videos/videogular.mp4';
    this.dialogsService.openVideo(url).subscribe();
  }
  public sendEmailSubscriptions(message: string, action: string) {
    // this.loading = true;
    this.email = this.notifyForm.controls['email'].value;
    this.authenticationService.sendEmailSubscriptions(this.email)
      .subscribe(
        // (response) => {this.snackBar.open('Email Subscribed', 'OK'); });
      );
    this.snackBar.open('Email Subscribed', 'OK', {
      duration: 800
    });
  }
}
