import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MediaUploaderService } from '../../mediaUploader/media-uploader.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProfileService } from '../../profile/profile.service';
import { CookieUtilsService } from '../../../_services/cookieUtils/cookie-utils.service';
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
  selector: 'app-verify-email-dialog',
  templateUrl: './verify-email-dialog.component.html',
  styleUrls: ['./verify-email-dialog.component.scss']
})
export class VerifyEmailDialogComponent implements OnInit {
  public step = 2;
  // private idProofImagePending: Boolean;
  public peer: FormGroup;
  public otp: FormGroup;
  private email: string;
  private success;
  public otpReceived: string;
  public userId;


  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private mediaUploader: MediaUploaderService,
    private _fb: FormBuilder,
    public _profileService: ProfileService,
    private http: HttpClient,
    public dialogRef: MatDialogRef<VerifyEmailDialogComponent>,
    private _cookieUtilsService: CookieUtilsService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.activatedRoute.params.subscribe(params => {
    });
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.peer = this._fb.group({
      email: ['',
        [Validators.required,
        Validators.pattern(EMAIL_REGEX)]],
      verificationIdUrl: ['', Validators.required]
    });
    this.otp = this._fb.group({
      inputOTP: [null]
    });

    this._profileService.getPeerNode(this.userId)
      .subscribe((res) => {
        this.peer.controls.email.setValue(res.email);
      });
  }

  continue(p) {
    this.step = p;
    console.log('email dialog opened');
    if (p === 3) {
      // this.peer.controls['email'].setValue(this.email);
      this.sendOTP();
    }
  }

  public sendOTP() {
    this._profileService.sendVerifyEmail(this.userId, this.peer.controls.email.value)
      .subscribe();
  }

  public resendOTP() {
    this._profileService.sendVerifyEmail(this.userId, this.peer.controls.email.value)
      .subscribe();
  }

  verifyEmail() {
    this.peer.controls['email'].setValue(this.email);
    this._profileService.confirmEmail(this.userId, this.otp.controls['inputOTP'].value)
      .subscribe((res) => {
        console.log(res);
        console.log('verified email');
        this.success = res;
        this.dialogRef.close(res);
      }, err => {
        console.log(err);
      });
  }
}

