import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertService } from '../_services/alert/alert.service';
import { AuthenticationService } from '../_services/authentication/authentication.service';
import { Observable } from 'rxjs/Observable';

import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  public model: any = {};
  public loading = false;
  public returnUrl: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authenticationService: AuthenticationService,
    private alertService: AlertService) { }

  ngOnInit() {
    // reset login status
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/learner-onboarding';
  }

  public submit() {
    alert('I m submitting');
    // form.submit();
  }

}
