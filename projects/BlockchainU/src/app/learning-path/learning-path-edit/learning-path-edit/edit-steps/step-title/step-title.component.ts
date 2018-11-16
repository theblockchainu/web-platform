import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChange } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepper, MatSnackBar } from '@angular/material';
import { EditService } from '../../edit-services/edit-services.service';
@Component({
  selector: 'app-step-title',
  templateUrl: './step-title.component.html',
  styleUrls: ['./step-title.component.scss']
})
export class StepTitleComponent implements OnInit {

  @Input() titleForm: FormGroup;
  @Input() stepper: MatStepper;
  busySavingData: boolean;

  constructor(
    private _editService: EditService,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }

  public submitLearningPath() {
    if (this.titleForm.dirty) {
      this.busySavingData = true;
      this._editService.submitCollection(this.titleForm.value).subscribe(res => {
        this.busySavingData = false;
        console.log(res);
        if (this.titleForm.valid) {
          this.stepper.next();
        } else {
          this.matSnackBar.open('Invalid Input', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.stepper.next();
    }
  }

}
