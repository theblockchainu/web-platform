import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CertificateService } from '../../../../../_services/certificate/certificate.service';
import { CollectionService } from '../../../../../_services/collection/collection.service';
import { MatStepper, MatSnackBar } from '@angular/material';
import { CustomCertificateFormComponent } from '../../../../../_shared/custom-certificate-form/custom-certificate-form.component';
import { EditService } from '../../edit-services/edit-services.service';
@Component({
  selector: 'app-step-certificate',
  templateUrl: './step-certificate.component.html',
  styleUrls: ['./step-certificate.component.scss']
})
export class StepCertificateComponent implements OnInit {
  @Input() stepper: MatStepper;
  @Input() certificateForm: FormGroup;

  @ViewChild('certificateComponent') certificateComponent: CustomCertificateFormComponent;

  busySavingData: boolean;

  certificateLoaded: boolean;

  constructor(
    private _fb: FormBuilder,
    private certificateService: CertificateService,
    public _collectionService: CollectionService,
    private snackBar: MatSnackBar,
    private _editService: EditService
  ) { }

  ngOnInit() {

  }



  submitCertificate(certificate: any) {
    this.busySavingData = true;
    this.certificateForm.controls['certificateHTML'].patchValue(certificate.htmlData);
    this.certificateForm.controls['formData'].patchValue(JSON.stringify(certificate.formData));
    this.certificateForm.controls['expiryDate'].patchValue(certificate.expiryDate);
    this._collectionService.submitCertificate(this._editService.learningPathId, this.certificateForm.value).subscribe(res => {
      console.log(res);
      this.stepper.next();
      this.busySavingData = false;
    }, err => {
      this.snackBar.open('An Error Occurred', 'Retry', {
        duration: 3000
      }).onAction().subscribe(res => {
        this.submitCertificate(certificate);
      });
    });
  }

  back() {
    this.stepper.previous();
  }

}
