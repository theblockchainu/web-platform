import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {FormGroup, FormBuilder, FormArray, Validators} from '@angular/forms';

@Component({
	selector: 'app-student-assessment-dialog',
	templateUrl: './student-assessment-dialog.component.html',
	styleUrls: ['./student-assessment-dialog.component.scss']
})
export class StudentAssessmentDialogComponent implements OnInit {
	
	public assessmentForm: FormGroup;
	public pendingParticipants = false;
	
	constructor(public dialogRef: MatDialogRef<StudentAssessmentDialogComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any,
				private _fb: FormBuilder) { }
	
	ngOnInit() {
		
		const participantsInitArray = [];
		console.log(this.data);
		this.pendingParticipants = true;
		this.data.participants.forEach(participant => {
			let isParticipantAssessed = false;
			let participantResult = '';
			this.data.assessment_models[0].assessment_rules.forEach(assessment_rule => {
				if (assessment_rule.assessment_result) {
					assessment_rule.assessment_result.forEach(result => {
						if (result.assessees && result.assessees.length > 0 && result.assessees[0].id === participant.id) {
							isParticipantAssessed = true;
							participantResult = assessment_rule;
							console.log(participantResult);
						}
					});
				}
				
			});
			participantsInitArray.push(
				this._fb.group({
					name: participant.profiles[0].first_name + ' ' + participant.profiles[0].last_name,
					id: participant.id,
					rule_obj: [{value: participantResult, disabled: isParticipantAssessed}, Validators.required]
				})
			);
		});
		
		this.assessmentForm = this._fb.group({
			participants: this._fb.array(participantsInitArray)
		});
		
		console.log(this.assessmentForm);
		
	}
	
	public getGyanForRule(gyanPercent, totalGyan) {
		return Math.floor((gyanPercent / 100) * totalGyan);
	}
	
	submitForm() {
		this.dialogRef.close(this.assessmentForm.value);
	}
	
}
