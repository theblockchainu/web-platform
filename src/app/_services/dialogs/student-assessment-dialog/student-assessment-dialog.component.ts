import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';

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
		this.pendingParticipants = false;
		this.data.participants.forEach(participant => {
			let isParticipantAssessed = false;
			let isParticipantEngagementAssessed = false;
			let isParticipantCommitmentAssessed = false;
			let participantResult = '';
			let engagementResult = '';
			let commitmentResult = '';
			this.data.assessment_models[0].assessment_rules.forEach(assessment_rule => {
				if (assessment_rule.assessment_result) {
					assessment_rule.assessment_result.forEach((result: any) => {
						if (result.assessees && result.assessees.length > 0 && result.assessees[0].id === participant.id) {
							isParticipantAssessed = true;
							participantResult = assessment_rule;
							console.log(participantResult);
						}
					});
				}

			});
			this.data.assessment_models[0].assessment_na_rules.forEach(assessment_na_rule => {
				if (assessment_na_rule.assessment_result) {
					assessment_na_rule.assessment_result.forEach((result: any) => {
						if (result.assessees && result.assessees.length > 0 && result.assessees[0].id === participant.id) {
							if (assessment_na_rule.value === 'engagement') {
								isParticipantEngagementAssessed = true;
								engagementResult = result.assessmentEngagementResult;
								console.log(engagementResult);
							}
							if (assessment_na_rule.value === 'commitment') {
								isParticipantCommitmentAssessed = true;
								commitmentResult = result.assessmentCommitmentResult;
								console.log(commitmentResult);
							}
						}
					});
				}

			});
			if (!isParticipantAssessed) {
				this.pendingParticipants = true;
				console.log('Assessment pending for : ' + participant.profiles[0].first_name + ' ' + participant.profiles[0].last_name);
			}
			participantsInitArray.push(
				this._fb.group({
					name: participant.profiles[0].first_name + ' ' + participant.profiles[0].last_name,
					id: participant.id,
					rule_obj: [{ value: participantResult, disabled: isParticipantAssessed }],
					engagement_result: [{ value: engagementResult, disabled: isParticipantEngagementAssessed }],
					commitment_result: [{ value: commitmentResult, disabled: isParticipantCommitmentAssessed }],
					isAssessed: isParticipantAssessed
				})
			);
		});

		this.assessmentForm = this._fb.group({
			participants: this._fb.array(participantsInitArray)
		});
	}

	public getGyanForRule(gyanPercent, totalGyan) {
		return Math.floor((gyanPercent / 100) * totalGyan);
	}

	submitForm() {
		const participants = [];
		this.assessmentForm.value.participants.forEach(participantObj => {
			if (participantObj.rule_obj && participantObj.rule_obj.value) {
				participants.push(participantObj);
			}
		});
		this.dialogRef.close({ participants: participants });
	}

}
