import {Component, OnInit, Inject, ViewChild, AfterViewInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatTable, MatDialog} from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import {Router} from '@angular/router';
import {environment} from '../../../../environments/environment';
import {AssessmentService} from '../../assessment/assessment.service';
import {CollectionService} from '../../collection/collection.service';
import * as _ from 'lodash';
import {ViewQuizSubmissionComponent} from '../view-quiz-submission/view-quiz-submission.component';
import {Observable} from 'rxjs';

@Component({
	selector: 'app-student-assessment-dialog',
	templateUrl: './student-assessment-dialog.component.html',
	styleUrls: ['./student-assessment-dialog.component.scss']
})
export class StudentAssessmentDialogComponent implements OnInit, AfterViewInit {

	public assessmentForm: FormGroup;
	public pendingParticipants = false;
	public loadingQuizSubmissions = true;
	public participantsInitArray = [];
	public userWiseSubmissionArray = [];
	public fetchingFromBlockchain = true;
	public selectedParticipants = 0;
	public totalAssessedParticipants = 0;
	public totalPendingParticipants = 0;
	public certificateCountMapping: { [k: string]: string };
	public displayedSubmissionTableColumns = ['questionsAnswered'];
	public loadingHttp = false;
	public collectionEthereumInfo;
	public isOnEthereum = false;
	
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
		this.certificateCountMapping = { '=0': 'No Smart Certificate', '=1': '1 Smart Certificate', 'other': '# Smart Certificates' };
	}
	
	ngAfterViewInit() {
		this.fetchingFromBlockchain = true;
		// Get ethereum data
		this.getEthereumInfo()
			.subscribe(res => {
				this.collectionEthereumInfo = res;
				if (res && res[6] && res[6] !== '0') {
					this.isOnEthereum = true;
				}
				this.loadData();
			}, (err) => {
				this.collectionEthereumInfo = null;
				this.isOnEthereum = false;
				this.loadData();
			});
	}
	
	private loadData() {
		this.participantsInitArray = [];
		this.totalAssessedParticipants = 0;
		this.totalPendingParticipants = 0;
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
			participant.savingOnEthereum = false;
			
			// Check participation on blockchain
			participant.hasEthereumAddress = participant.ethAddress && participant.ethAddress.substring(0, 2) === '0x';
			
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
			
			this.data.assessment_models[0].assessment_rules.forEach((assessment_rule, i) => {
				if (this.collectionEthereumInfo && this.collectionEthereumInfo[2] && this.collectionEthereumInfo[2].length >= i + 1) {
					// If Blockchain Assessment rules do not MATCH, override with Blockchain rules
					assessment_rule.value = _.find(this.collectionEthereumInfo[2], ethereumRule => ethereumRule === assessment_rule.value ) ? assessment_rule.value : this.collectionEthereumInfo[2][i] ;
				}
				if (assessment_rule.assessment_result) {
					assessment_rule.assessment_result.forEach((result: any) => {
						if (result.assessees && result.assessees.length > 0 && result.assessees[0].id === participant.id) {
							isParticipantAssessed = true;
							this.totalAssessedParticipants++;
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
		
		this.totalPendingParticipants = this.data.participants.length - this.totalAssessedParticipants;
		
		this.assessmentForm = this._fb.group({
			participants: this._fb.array(this.participantsInitArray)
		});
		// Update every user's blockchain participation status
		this.checkBlockchainParticipation();
		this.loadQuizAssessments()
			.subscribe(res => {
				this.userWiseSubmissionArray.push(res);
				this.loadingQuizSubmissions = false;
			});
	}
	
	private checkBlockchainParticipation() {
		this.fetchingFromBlockchain = true;
		this.collectionService.getBlockchainParticipants(this.data.collection.id)
			.subscribe(res => {
				if (res && res['result']) {
					this.participantsInitArray.forEach(participant => {
						// If this participant exists in the returned blockchain list
						const hasEthereumAddress = participant.value.ethAddress && participant.value.ethAddress.substring(0, 2) === '0x';
						if (hasEthereumAddress && _.some(res['participants'], ethParticipant => ethParticipant.toLowerCase() === participant.value.ethAddress.toLowerCase())) {
							participant['controls']['isOnEthereum'].patchValue(true);
						}
					});
					this.fetchingFromBlockchain = false;
				} else {
					this.fetchingFromBlockchain = false;
				}
			}, error1 => {
				this.fetchingFromBlockchain = false;
			});
	}
	
	private getEthereumInfo() {
		return this.collectionService.getCollectionEthereumInfo(this.data.collection.id, {});
	}
	
	private loadQuizAssessments() {
		this.loadingQuizSubmissions = true;
		return new Observable(obs => {
			this.participantsInitArray.forEach(participant => {
				const userWiseSubmissionObject = {
					participantId: participant.value.id,
					submissions: []
				};
				if (this.data.quizContents && this.data.quizContents.length > 0) {
					this.data.quizContents.forEach(quizContent => {
						this.assessmentService.getUserQuizSubmissions(quizContent, participant.value.id)
							.subscribe(res => {
								const submissionObject = {
									quizId: quizContent.id,
									quizTitle: quizContent.title,
									quizSubmissions: res
								};
								userWiseSubmissionObject.submissions.push(submissionObject);
							});
					});
				}
				obs.next(userWiseSubmissionObject);
			});
		});
	}

	public getGyanForRule(gyanPercent, totalGyan) {
		if (!gyanPercent || !totalGyan) {
			return 0;
		}
		return Math.floor((gyanPercent / 100) * totalGyan);
	}

	submitForm() {
		this.loadingHttp = true;
		const participants = [];
		this.assessmentForm.value.participants.forEach(participantObj => {
			if (participantObj.rule_obj && participantObj.rule_obj.value) {
				participants.push(participantObj);
			}
		});
		this.loadingHttp = false;
		this.dialogRef.close({ participants: participants });
	}
	
	public openCertificate(certificateId) {
		window.open(environment.clientUrl + '/certificate/' + certificateId, '_blank');
		/*this.router.navigate(['/certificate', certificateId]);*/
	}
	
	public resendCertificate(certificateId, assessmentId, index) {
		this.loadingHttp = true;
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
					this.snackBar.open('Your certificate re-issue request has been accepted. Certificate will be shared over email soon.', 'OK', {duration: 5000});
					this.data.participants[index].certificates.push(res);
					this.loadData();
				} else {
					this.snackBar.open('Error occurred. Try again later.', 'OK', {duration: 5000});
				}
				this.loadingHttp = false;
			}, err => {
				this.loadingHttp = false;
				this.snackBar.open('Cannot re-issue certificate. No backup available. Contact us to resolve this issue.', 'DISMISS', {duration: 5000});
			});
	}
	
	public addParticipantToBlockchain(participant) {
		this.loadingHttp = true;
		participant.controls['savingOnEthereum'].patchValue(true);
		this.collectionService.addParticipantToEthereum(this.data.collection.id, participant.value.id)
			.subscribe(res => {
				if (res) {
					console.log(res);
					participant.controls['isOnEthereum'].patchValue(true);
					participant.controls['savingOnEthereum'].patchValue(false);
				}
				this.loadingHttp = false;
			}, err => {
				console.log(err);
				participant.controls['isOnEthereum'].patchValue(false);
				participant.controls['savingOnEthereum'].patchValue(false);
				this.loadingHttp = false;
			});
	}
	
	public filterMySubmissions(submissions, userId) {
		return _.filter(submissions, (s) => {
			return s.peerId === userId;
		});
	}
	
	public selectedAssessmentValue(event) {
		console.log(event);
		if (event.value && event.value.value.length > 0) {
			this.selectedParticipants++;
		} else {
			this.selectedParticipants = Math.max(this.selectedParticipants - 1, 0);
		}
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
