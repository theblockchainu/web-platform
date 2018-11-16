import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material';
import { EditService } from '../../edit-services/edit-services.service';
import { DialogsService } from '../../../../../_services/dialogs/dialog.service';
@Component({
  selector: 'app-step-description',
  templateUrl: './step-description.component.html',
  styleUrls: ['./step-description.component.scss']
})
export class StepDescriptionComponent implements OnInit {

  @Input() descriptionForm: FormGroup;
  @Input() stepper: MatStepper;

  busySavingData: boolean;
  editorOptions: any;

  constructor(
    private _editService: EditService,
    private dialogsService: DialogsService
  ) { }

  ngOnInit() {
    this.editorOptions = {
      'hideIcons': ['FullScreen']
    };
  }

  submitLearningPath() {
    if (this.descriptionForm.dirty) {
      this.busySavingData = true;
      this._editService.submitCollection(this.descriptionForm.value).subscribe(res => {
        this.busySavingData = false;
        this.stepper.next();
      });
    } else {
      this.stepper.next();
    }

  }

  insertImage() {
    this.dialogsService.addImageDialog().subscribe(res => {
      if (res) {
        this.descriptionForm.controls['description'].patchValue(this.descriptionForm.value.description + ' ![](' + res + ') ');
      }
    }, err => {
      console.log(err);
    });
  }

}
