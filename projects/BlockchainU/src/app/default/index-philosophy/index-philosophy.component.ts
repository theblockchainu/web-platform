import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule, MatMenuModule, MatToolbarModule, MatIconModule, MatAutocompleteModule, MatInputModule, MatNativeDateModule, MatProgressSpinnerModule, MatProgressBarModule } from '@angular/material';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { FormGroup, FormArray, FormBuilder, FormControl, AbstractControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-index-phil',
  templateUrl: './index-philosophy.component.html',
  styleUrls: ['./index-philosophy.component.scss']
})
export class IndexPhilComponent implements OnInit {
  public first = false;
  private email: string;
  notifyForm: FormGroup;
  public transformationSelected = false;
  public pplFocussedSelected = false;
  public courageSelected = false;
  public collabSelected = false;
  public optimismSelected = false;

  constructor(private authenticationService: AuthenticationService,
    public _fb: FormBuilder) {
    this.transformationSelected = true;
  }

  ngOnInit() {
    this.notifyForm = this._fb.group(
      { email: ['', Validators.required] }
    );
  }

  public showTransformation(state) {
    this.transformationSelected = state;
    this.pplFocussedSelected = !state;
    this.courageSelected = !state;
    this.collabSelected = !state;
    this.optimismSelected = !state;
  }

  public showPplFocussed(state) {
    this.transformationSelected = !state;
    this.pplFocussedSelected = state;
    this.courageSelected = !state;
    this.collabSelected = !state;
    this.optimismSelected = !state;
  }

  public showCourage(state) {
    this.transformationSelected = !state;
    this.pplFocussedSelected = !state;
    this.courageSelected = state;
    this.collabSelected = !state;
    this.optimismSelected = !state;
  }

  public showCollab(state) {
    this.transformationSelected = !state;
    this.pplFocussedSelected = !state;
    this.courageSelected = !state;
    this.collabSelected = state;
    this.optimismSelected = !state;
  }
  public showOptimism(state) {
    this.transformationSelected = !state;
    this.pplFocussedSelected = !state;
    this.courageSelected = !state;
    this.collabSelected = !state;
    this.optimismSelected = state;
  }

  public showFirst(state) {
    this.first = state;
  }
  public sendEmailSubscriptions() {
    // this.loading = true;
    this.email = this.notifyForm.controls['email'].value;
    this.authenticationService.sendEmailSubscriptions(this.email)
      .subscribe();
  }
}
