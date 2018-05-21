import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../_services/profile/profile.service';
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  signupForm: FormGroup;
  hide = true;
  public emailRegister = false;

  constructor(private _fb: FormBuilder,
    private _ProfileService: ProfileService,
    private _router: Router,
    private _MatSnackBar: MatSnackBar) { }

  ngOnInit() {
    this.signupForm = this._fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', Validators.email],
      password: ['', Validators.required],
      birthdate: ['', Validators.required]
    });
  }

  signupEmail() {
    this.emailRegister = true;
  }

  submitForm() {
    if (this.signupForm.valid) {
      const registerObject = this.signupForm.value;
      const birthdate = <Date>registerObject.birthdate;
      delete registerObject.birthdate;
      registerObject.dobDay = birthdate.getDay();
      registerObject.dobMonth = birthdate.getMonth();
      registerObject.dobYear = birthdate.getFullYear();
      this._ProfileService.signup(registerObject).subscribe((res: any) => {
        if (res.status === 'failed') {
          this._MatSnackBar.open(res.reason, 'close', { duration: 3000 });
        } else {
          console.log(res);
          // this._router.navigate(['']);
          location.reload();
        }
      }, err => {
        console.log(err);
        // this._MatSnackBar.open('An error occured', 'close', { duration: 3000 });
        // this._router.navigate(['']);
        location.reload();
      });
    }
  }

}
