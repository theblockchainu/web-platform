import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';

@Component({
  selector: 'app-student-assessment-dialog',
  templateUrl: './student-assessment-dialog.component.html',
  styleUrls: ['./student-assessment-dialog.component.scss']
})
export class StudentAssessmentDialogComponent implements OnInit {

  public assessmentForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<StudentAssessmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: FormBuilder) { }

  ngOnInit() {

    const participantsInitArray = [];
    console.log(this.data);
    this.data.participants.forEach(participant => {
      participantsInitArray.push(
        this._fb.group({
          name: participant.profiles[0].first_name + ' ' + participant.profiles[0].last_name,
          id: participant.id,
          rule_obj: ''
        })
      );
    });

    this.assessmentForm = this._fb.group({
      participants: this._fb.array(participantsInitArray)
    });

    console.log(this.assessmentForm);

  }

  submitForm() {
    this.dialogRef.close(this.assessmentForm.value);
  }

}
