import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MediaUploaderService } from '../../_services/mediaUploader/media-uploader.service';
import { ProfileService } from '../../_services/profile/profile.service';
import { MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar } from '@angular/material';
import { DialogsService } from '../../_services/dialogs/dialog.service';
import { CookieUtilsService } from '../../_services/cookieUtils/cookie-utils.service';
import {environment} from '../../../environments/environment';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
  selector: 'app-upload-docs',
  templateUrl: './upload-docs.component.html',
  styleUrls: ['./upload-docs.component.scss']
})
export class UploadDocsComponent implements OnInit {
  public step = 1;
  public uploadingImage = false;
  public peer: FormGroup;
  public otp: FormGroup;
  public email: string;
  public success;
  public otpReceived: string;
  public verificationIdUrl: string;
  public fileType;
  public fileName;
  public userId;
  public otpError: string;
  public envVariable;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private mediaUploader: MediaUploaderService,
    private _fb: FormBuilder,
    public _profileService: ProfileService,
    private http: HttpClient,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dialogsService: DialogsService,
    private _cookieUtilsService: CookieUtilsService) {
    this.activatedRoute.params.subscribe(params => {
      this.step = params['step'];
    });
      this.envVariable = environment;
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
    if (p === 2) {
      this._profileService
        .updatePeer(this.userId, {
          'verificationIdUrl': this.peer.controls['verificationIdUrl'].value,
          'email': this.peer.controls['email'].value
        })
        .subscribe((response) => {
          console.log('File Saved Successfully');
        }, (err) => {
          console.log('Error updating Peer: ');
          console.log(err);
        });
    }
    if (p === 3) {
      // this.peer.controls['email'].setValue(this.email);
      this.sendOTP();
    }
    this.step = p;
    this.router.navigate(['app-upload-docs', +this.step]);
  }

  public sendOTP() {
    this._profileService.sendVerifyEmail(this.userId, this.peer.controls.email.value)
      .subscribe();
    console.log('mail sent');
  }


  public resendOTP() {
    this._profileService.sendVerifyEmail(this.userId, this.peer.controls.email.value)
      .subscribe((response) => {
        this.snackBar.open('Code Resent', 'OK', {
          duration: 800
        });
      });
  }

  verifyEmail() {
    this._profileService.confirmEmail(this.userId, this.otp.controls['inputOTP'].value)
      .subscribe((res) => {
        console.log(res);
        console.log('verified email');
        this.success = res;
        this.router.navigate(['/onboarding/1']);
      },
        (err) => {
          console.log(err);
          if (err.status === 400) {
            this.otpError = 'The code you entered does not match our records. Did you enter the most recent one?';
            // this.otp.controls['inputOTP'].setValue('');
          }

        }
      );
  }

  redirectToOnboarding() {
    this.router.navigate(['/onboarding/1']);
  }

  uploadImage(event) {
    // this.peer.controls['email'].setValue(this.email);
    this.uploadingImage = true;
    console.log(event.files);
    for (const file of event.files) {
      this.mediaUploader.upload(file).map((responseObj) => {
        this.verificationIdUrl = responseObj.url;
        this.fileName = responseObj['originalFilename'];
        this.fileType = responseObj.type;
        this.peer.controls['verificationIdUrl'].setValue(responseObj.url);
        this.uploadingImage = false;
      }).subscribe();
    }
  }

  deleteFromContainer(url: string, type: string) {
    if (type === 'image' || type === 'file') {
      this._profileService.updatePeer(this.userId, {
        'verificationIdUrl': ''
      }).subscribe((response: any) => {
        this.verificationIdUrl = response.picture_url;
      });
    } else {
      console.log('error');
    }
  }
  public openIdPolicy() {
    this.dialogsService.openIdPolicy().subscribe();
  }
}
