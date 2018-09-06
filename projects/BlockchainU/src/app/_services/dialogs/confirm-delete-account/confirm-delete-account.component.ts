import { Component, OnInit, Inject } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-confirm-delete-account',
  templateUrl: './confirm-delete-account.component.html',
  styleUrls: ['./confirm-delete-account.component.scss']
})
export class ConfirmDeleteAccountComponent implements OnInit {

  public password;

  constructor(
    private profileService: ProfileService,
    private matSnackbar: MatSnackBar,
    public dialogRef: MatDialogRef<ConfirmDeleteAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
  }

  checkAndConfirm() {
    console.log(this.password);
    if (this.password && this.password.length > 0) {
      this.profileService.changePassword(this.data, this.password, 'delete').subscribe(res => {
        console.log(res);
        this.dialogRef.close(true);
      }, err => {
        console.log(err);
        if (err.error && err.error.error && err.error.error.code === 'INVALID_PASSWORD') {
          this.matSnackbar.open('Wrong password', 'Close', { duration: 3000 });
        } else {
          this.matSnackbar.open('Error in verifying password', 'Close', { duration: 3000 });
        }
      });
    }

  }

}
