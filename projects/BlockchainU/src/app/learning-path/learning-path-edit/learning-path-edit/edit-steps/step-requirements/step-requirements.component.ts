import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material';
import { EditService } from '../../edit-services/edit-services.service';
import { DialogsService } from '../../../../../_services/dialogs/dialog.service';

@Component({
  selector: 'app-step-requirements',
  templateUrl: './step-requirements.component.html',
  styleUrls: ['./step-requirements.component.scss']
})
export class StepRequirementsComponent implements OnInit {

  @Input() requirementsForm: FormGroup;
  @Input() stepper: MatStepper;
  busySavingData: boolean;
  difficulties: Array<any>;

  constructor(
    private _editService: EditService
  ) { }

  ngOnInit() {
    this.difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  }

  submitLearningPath() {
    if (this.requirementsForm.dirty) {
      this.busySavingData = true;
      this._editService.submitCollection(this.requirementsForm.value).subscribe(res => {
        this.busySavingData = false;
        this.stepper.next();
      });
    } else {
      this.stepper.next();
    }

  }

}
