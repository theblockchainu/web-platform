import {Component, OnInit, Inject, ViewChild} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatTable, MatDialog} from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import {Router} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {AssessmentService} from '../../assessment/assessment.service';
import {CollectionService} from '../../collection/collection.service';
import * as _ from 'lodash';
import {ViewQuizSubmissionComponent} from '../view-quiz-submission/view-quiz-submission.component';

@Component({
	selector: 'app-student-assessment-dialog',
	templateUrl: './student-assessment-dialog.component.html',
	styleUrls: ['./student-assessment-dialog.component.scss']
})
export class StudentAssessmentDialogComponent implements OnInit {

	public assessmentForm: FormGroup;
	public pendingParticipants = false;
	public loadingQuizSubmissions = true;
	public participantsInitArray = [];
	public userWiseSubmissionArray = [];
	public displayedSubmissionTableColumns = ['questionsAnswered'];
	
	@ViewChild(MatTable) table: MatTable<any>;

	constructor(public dialogRef: MatDialogRef<StudentAssessmentDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private router: Router,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private assessmentService: AssessmentService,
		private collectionService: CollectionService,
		private _fb: FormBuilder) { }

	ngOnInit() {
		this.loadData();
	}
	
	private loadData() {
		this.participantsInitArray = [];
		this.pendingParticipants = false;
		this.data.participants.forEach(participant => {
			let isParticipantAssessed = false;
			let isParticipantEngagementAssessed = false;
			let isParticipantCommitmentAssessed = false;
			let participantAssessmentId = '';
			let participantResult = '';
			let engagementResult = '';
			let commitmentResult = '';
			participant.hasCertificate = false;
			participant.isOnEthereum = false;
			participant.isScholarshipOnEthereum = false;
			participant.savingOnEthereum = true;
			
			// Check participation on blockchain
			participant.hasEthereumAddress = participant.ethAddress && participant.ethAddress.substring(0, 2) === '0x';
			if (participant.hasEthereumAddress) {
				this.collectionService.getParticipantEthereumInfo(this.data.collection.id, participant.ethAddress)
					.subscribe(res => {
						console.log(res);
						const resultParticipantFormGroup = this.assessmentForm && this.assessmentForm.controls ? _.find(this.assessmentForm['controls']['participants']['controls'], fgItem => fgItem['controls']['ethAddress'].value.toLowerCase() === res['participantId'] ) : undefined;
						if (res && res['result'] === true) {
							participant.isOnEthereum = true;
							if (resultParticipantFormGroup) {
								resultParticipantFormGroup['controls']['isOnEthereum'].patchValue(true);
								resultParticipantFormGroup['controls']['savingOnEthereum'].patchValue(false);
							}
						} else {
							participant.isOnEthereum = false;
							if (resultParticipantFormGroup) {
								resultParticipantFormGroup['controls']['isOnEthereum'].patchValue(false);
								resultParticipantFormGroup['controls']['savingOnEthereum'].patchValue(false);
							}
						}
						
					}, err => {
						console.log(err);
						const resultParticipantFormGroup = this.assessmentForm && this.assessmentForm.controls ? _.find(this.assessmentForm['controls']['participants']['controls'], fgItem => fgItem['controls']['ethAddress'].value.toLowerCase() === err['participantId']) : undefined;
						participant.isOnEthereum = false;
						if (resultParticipantFormGroup) {
							resultParticipantFormGroup['controls']['isOnEthereum'].patchValue(false);
							resultParticipantFormGroup['controls']['savingOnEthereum'].patchValue(false);
						}
					});
				this.collectionService.getParticipantScholarshipInfo(this.data.globalScholarshipId, participant.ethAddress)
					.subscribe(res => {
						console.log(res);
						const resultParticipantFormGroup = this.assessmentForm && this.assessmentForm.controls ? _.find(this.assessmentForm['controls']['participants']['controls'], fgItem => fgItem['controls']['ethAddress'].value.toLowerCase() === res['participantId'] ) : undefined;
						if (res && res['result'] === true) {
							participant.isScholarshipOnEthereum = true;
							if (resultParticipantFormGroup) {
								resultParticipantFormGroup['controls']['isScholarshipOnEthereum'].patchValue(true);
								resultParticipantFormGroup['controls']['savingOnEthereum'].patchValue(false);
							}
						} else {
							participant.isScholarshipOnEthereum = false;
							if (resultParticipantFormGroup) {
								resultParticipantFormGroup['controls']['isScholarshipOnEthereum'].patchValue(false);
								resultParticipantFormGroup['controls']['savingOnEthereum'].patchValue(false);
							}
						}
						
					}, err => {
						console.log(err);
						const resultParticipantFormGroup = this.assessmentForm && this.assessmentForm.controls ? _.find(this.assessmentForm['controls']['participants']['controls'], fgItem => fgItem['controls']['ethAddress'].value.toLowerCase() === err['participantId']) : undefined;
						participant.isScholarshipOnEthereum = false;
						if (resultParticipantFormGroup) {
							resultParticipantFormGroup['controls']['isScholarshipOnEthereum'].patchValue(false);
							resultParticipantFormGroup['controls']['savingOnEthereum'].patchValue(false);
						}
					});
			} else {
				participant.isOnEthereum = false;
				participant.isScholarshipOnEthereum = false;
				participant.savingOnEthereum = false;
			}
			
			if (participant.certificates) {
				participant.certificates.forEach(certificate => {
					if (certificate && certificate.stringifiedJSON && certificate.stringifiedJSON.length > 0) {
						const certificateData = JSON.parse(certificate.stringifiedJSON);
						if (certificateData.collection !== undefined && certificateData.collection.id === this.data.collection.id) {
							participant.hasCertificate = true;
							participant.certificateId = certificate.id;
						}
					} else if (certificate && certificate.stringifiedJSONWithoutSignature && certificate.stringifiedJSONWithoutSignature.length > 0) {
						const certificateNonSignedData = JSON.parse(certificate.stringifiedJSONWithoutSignature);
						if (certificateNonSignedData.collection !== undefined && certificateNonSignedData.collection.id === this.data.collection.id) {
							participant.certificateId = certificate.id;
						}
					}
				});
			}
			this.data.assessment_models[0].assessment_rules.forEach(assessment_rule => {
				if (assessment_rule.assessment_result) {
					assessment_rule.assessment_result.forEach((result: any) => {
						if (result.assessees && result.assessees.length > 0 && result.assessees[0].id === participant.id) {
							isParticipantAssessed = true;
							participantResult = assessment_rule;
							participantAssessmentId = result.id;
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
			this.participantsInitArray.push(
				this._fb.group({
					name: participant.profiles[0].first_name + ' ' + participant.profiles[0].last_name,
					id: participant.id,
					rule_obj: [{ value: participantResult, disabled: isParticipantAssessed }],
					engagement_result: [{ value: engagementResult, disabled: isParticipantEngagementAssessed }],
					commitment_result: [{ value: commitmentResult, disabled: isParticipantCommitmentAssessed }],
					isAssessed: isParticipantAssessed,
					isOnEthereum: participant.isOnEthereum,
					isScholarshipOnEthereum: participant.isScholarshipOnEthereum,
					savingOnEthereum: participant.savingOnEthereum,
					hasCertificate: participant.hasCertificate,
					certificateId: participant.certificateId,
					assessmentId: participantAssessmentId,
					ethAddress: participant.ethAddress
				})
			);
		});
		
		this.loadQuizAssessments();
		
		this.assessmentForm = this._fb.group({
			participants: this._fb.array(this.participantsInitArray)
		});
	}
	
	private loadQuizAssessments() {
		this.loadingQuizSubmissions = true;
		
		this.userWiseSubmissionArray = [];
		this.participantsInitArray.forEach(participant => {
			const userWiseSubmissionObject = {
				participantId: participant.value.id,
				submissions: []
			};
			if (this.data.quizContents && this.data.quizContents.length > 0) {
				this.data.quizContents.forEach(quizContent => {
					this.assessmentService.processQuizSubmissions(quizContent)
						.subscribe(res => {
							const submissionObject = {
								quizId: quizContent.id,
								quizTitle: quizContent.title,
								quizSubmissions: this.filterMySubmissions(res, participant.value.id)
							};
							userWiseSubmissionObject.submissions.push(submissionObject);
						});
				});
			}
			this.userWiseSubmissionArray.push(userWiseSubmissionObject);
		});
		
		this.loadingQuizSubmissions = false;
	}

	public getGyanForRule(gyanPercent, totalGyan) {
		if (!gyanPercent || !totalGyan) {
			return 0;
		}
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
	
	public openCertificate(certificateId) {
		window.open(environment.clientUrl + '/certificate/' + certificateId, '_blank');
		/*this.router.navigate(['/certificate', certificateId]);*/
	}
	
	public resendCertificate(certificateId, assessmentId, index) {
		const body = {
			certificateId: certificateId,
			assessmentId: assessmentId,
			collectionId: this.data.collection.id,
			collectionTitle: this.data.collection.title,
			collectionType: this.data.collection.type
		};
		this.assessmentService.reissueCertificate(body)
			.subscribe(res => {
				if (res) {
					this.snackBar.open('Certificate has been re-issued and sent to participant over email.', 'OK', {duration: 5000});
					this.data.participants[index].certificates.push(res);
					this.loadData();
				} else {
					this.snackBar.open('Error occurred. Try again later.', 'OK', {duration: 5000});
				}
			}, err => {
				this.snackBar.open('Cannot re-issue certificate. No backup available.', 'DISMISS', {duration: 5000});
			});
	}
	
	public addParticipantToBlockchain(participant) {
		participant.controls['savingOnEthereum'].patchValue(true);
		this.collectionService.addParticipantToEthereum(this.data.collection.id, participant.value.id)
			.subscribe(res => {
				if (res) {
					console.log(res);
					participant.controls['isOnEthereum'].patchValue(true);
					participant.controls['savingOnEthereum'].patchValue(false);
				}
			}, err => {
				console.log(err);
				participant.controls['isOnEthereum'].patchValue(false);
				participant.controls['savingOnEthereum'].patchValue(false);
			});
	}
	
	public filterMySubmissions(submissions, userId) {
		return _.filter(submissions, (s) => {
			return s.peerId === userId;
		});
	}
	
	public openQuizSubmission(element) {
		let dialogRef: MatDialogRef<ViewQuizSubmissionComponent>;
		
		dialogRef = this.dialog.open(ViewQuizSubmissionComponent, {
			panelClass: 'responsive-dialog',
			width: '45vw',
			height: '100vh',
			disableClose: true,
			data: {
				content: element
			}
		});
		dialogRef.afterClosed()
			.subscribe(res => {
				if (res) {
					element = res;
				}
			});
	}

}
