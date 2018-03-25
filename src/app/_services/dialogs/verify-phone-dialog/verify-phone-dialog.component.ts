import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MediaUploaderService } from '../../mediaUploader/media-uploader.service';
import { MatSnackBar } from '@angular/material';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ProfileService } from '../../profile/profile.service';
import { CookieUtilsService } from '../../cookieUtils/cookie-utils.service';

@Component({
  selector: 'app-verify-phone-dialog',
  templateUrl: './verify-phone-dialog.component.html',
  styleUrls: ['./verify-phone-dialog.component.scss']
})
export class VerifyPhoneDialogComponent implements OnInit {
  public step = 2;
  public peer: FormGroup;
  public otp: FormGroup;
  private phone: number;
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
    public snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<VerifyPhoneDialogComponent>,
    public _cookieUtilsService: CookieUtilsService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.activatedRoute.params.subscribe(params => {
    });
    this.userId = _cookieUtilsService.getValue('userId');
  }

  ngOnInit() {
    this.peer = this._fb.group({
      phone: ['', Validators.required]
    });

    this.otp = this._fb.group({
      inputOTP: [null]
    });
    this._profileService.getPeerNode(this.userId)
      .subscribe((res) => {
        this.peer.controls.phone.setValue(res.phone);
      });
  }

  continue(p) {
    this.step = p;
    console.log('phone dialog opened');
    this._profileService
      .updatePeer(this.userId, { 'phone': this.peer.controls['phone'].value })
      .subscribe();
    console.log('phone dialog opened 2');
    if (p === 3) {
      console.log('phone dialog opened 3');
      // this.peer.controls['phone'].setValue(this.phone);
      this.sendOTP();
      console.log('phone dialog opened 4');
    }
  }

  public sendOTP() {
    this._profileService.sendVerifySms(this.peer.controls.phone.value)
      .subscribe();
    console.log(this.phone);
    console.log('otp sent');
  }

  public resendOTP() {
    this._profileService.sendVerifyEmail(this.userId, this.peer.controls.phone.value)
      .subscribe((response) => {
        this.snackBar.open('Code Resent', 'OK', {
          duration: 800
        });
      });
  }

  verifyPhone() {
    // this.peer.controls['phone'].setValue(this.phone);
    console.log(this.otp.controls['inputOTP'].value);
    this._profileService.confirmSmsOTP(this.otp.controls['inputOTP'].value)
      .subscribe((res) => {
        console.log(res.phone);
        console.log('verified phone');
        this.success = res;
        // this.peer.controls.phone.setValue(res.phone);
        this.dialogRef.close();
      }, err => {
        console.log(err);
      });
  }
}
