import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogsService } from './dialog.service';
import { SharedModule } from '../../_shared/_shared.module';
import { FormsModule, ReactiveFormsModule, NgModel } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { RouterModule } from '@angular/router';

import { SignupComponentDialogComponent } from './signup-dialog/signup-dialog.component';
import { LoginComponentDialog } from './login-dialog/login-dialog.component';
import { RequestPasswordDialogComponent } from './forgot-pwd-dialog/forgot-pwd-dialog.component';
import { AddCardDialogComponent } from './add-card-dialog/add-card-dialog.component';
import { TwilioServicesService } from '../twlio_services/twilio-services.service';
import { LiveSessionDialogComponent } from './live-session-dialog/live-session-dialog.component';
import { MultiselectTopicDialogComponent } from './multiselect-topic-dialog/multiselect-topic-dialog.component';
import { VerifyIdDialogComponent } from './verify-id-dialog/verify-id-dialog.component';
import { VerifyEmailDialogComponent } from './verify-email-dialog/verify-email-dialog.component';
import { IdPolicyDialogComponent } from './id-policy-dialog/id-policy-dialog.component';
import { VideoDialogComponent } from './video-dialog/video-dialog.component';
import { VerifyPhoneDialogComponent } from './verify-phone-dialog/verify-phone-dialog.component';
import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
import { CollectionGridDialogComponent } from './collection-grid-dialog/collection-grid-dialog.component';
import { ProfilePopupCardComponent } from './profile-popup-card/profile-popup-card.component';
import { ExitCollectionDialogComponent } from './exit-collection-dialog/exit-collection-dialog.component';
import { CancelCollectionDialogComponent } from './cancel-collection-dialog/cancel-collection-dialog.component';
import { DeleteCollectionDialogComponent } from './delete-collection-dialog/delete-collection-dialog.component';
import { EditCalendarDialogComponent } from './edit-calendar-dialog/edit-calendar-dialog.component';
import { AddTopicDialogComponent } from './add-topic-dialog/add-topic-dialog.component';
import { AddLanguageDialogComponent } from './add-language-dialog/add-language-dialog.component';
import { ViewConflictDialogComponent } from './view-conflict-dialog/view-conflict-dialog.component';
import { SelectDateDialogComponent } from './select-date-dialog/select-date-dialog.component';
import { CollectionCloneDialogComponent } from './collection-clone-dialog/collection-clone-dialog.component';
import { CollectionSubmitDialogComponent } from './collection-submit-dialog/collection-submit-dialog.component';
import { SubmissionViewComponent } from './submission-view/submission-view.component';
import { SubmitEntryComponent } from './submit-entry/submit-entry.component';
import { ViewEntryDialogComponent } from './view-entry-dialog/view-entry-dialog.component';
import { InviteFriendsDialogComponent } from './invite-friends-dialog/invite-friends-dialog.component';
import { ReportProfileComponent } from './report-profile/report-profile.component';
import { ProjectSubmissionService } from '../project-submission/project-submission.service';
import { DeleteCohortDialogComponent } from './delete-cohort-dialog/delete-cohort-dialog.component';
import { CancelCohortDialogComponent } from './cancel-cohort-dialog/cancel-cohort-dialog.component';
import { RateParticipantComponent } from './rate-participant-dialog/rate-participant-dialog.component';
import { ShareDialogComponent } from './share-dialog/share-dialog.component';
import { DeleteCommunityDialogComponent } from './delete-community-dialog/delete-community-dialog.component';
import { ExitCommunityDialogComponent } from './exit-community-dialog/exit-community-dialog.component';
import { DateConflictDialogComponent } from './date-conflict-dialog/date-conflict-dialog.component';
import { EditSubmissionDialogComponent } from './edit-submission-dialog/edit-submission-dialog.component';
import { InboxDialogComponent } from './inbox-dialog/inbox-dialog.component';
import { MessageParticipantDialogComponent } from './message-participant-dialog/message-participant-dialog.component';
import { ViewParticipantsComponent } from './view-participants/view-participants.component';
import { StudentAssessmentDialogComponent } from './student-assessment-dialog/student-assessment-dialog.component';
import { GyanTransactionsDialogComponent } from './gyan-transactions-dialog/gyan-transactions-dialog.component';
import { RequestCommunityDialogComponent } from './request-community-dialog/request-community-dialog.component';
import { ScholarshipDialogComponent } from './scholarship-dialog/scholarship-dialog.component';
import { GenerateKnowledgeStoryComponent } from './generate-knowledge-story/generate-knowledge-story.component';
import { RequestKnowledgeStoryComponent } from './request-knowledge-story/request-knowledge-story.component';
import { ConfirmPasswordDialogComponent } from './confirm-password-dialog/confirm-password-dialog.component';
import { AddViewerDialogComponent } from './add-viewer-dialog/add-viewer-dialog.component';
import { GyanPromptComponent } from './gyan-prompt/gyan-prompt.component';
import { AddCommunityDialogComponent } from './add-community-dialog/add-community-dialog.component';
import { CreateAccreditationDialogComponent } from './create-accreditation-dialog/create-accreditation-dialog.component';
import { SelectFieldDialogComponent } from './select-field-dialog/select-field-dialog.component';
import { CertificateVerificationComponent } from './certificate-verification/certificate-verification.component';
import { CollectionStandardsDialogComponent } from './collection-standards-dialog/collection-standards-dialog.component';
import { TermsAndConditionsDialogComponent } from './terms-and-conditions-dialog/terms-and-conditions-dialog.component';
import { SocialSharingService } from '../social-sharing/social-sharing.service';
import { OnboardingDialogComponent } from './onboarding-dialog/onboarding-dialog.component';
import { AddPromoCodeDialogComponent } from './add-promo-code-dialog/add-promo-code-dialog.component';
import { ViewPromocodeDialogComponent } from './view-promocode-dialog/view-promocode-dialog.component';
import { AddParticipantDialogComponent } from './add-participant-dialog/add-participant-dialog.component';
import { ConfirmDeleteAccountComponent } from './confirm-delete-account/confirm-delete-account.component';
import { AddImageDialogComponent } from './add-image-dialog/add-image-dialog.component';
import { AskQuestionDialogComponent } from './ask-question-dialog/ask-question-dialog.component';
import { SubmissionReviewDialogComponent } from './submission-review-dialog/submission-review-dialog.component';
import { GenericPromptDialogComponent } from './generic-prompt-dialog/generic-prompt-dialog.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		SharedModule,
		VgCoreModule,
		VgControlsModule,
		VgOverlayPlayModule,
		VgBufferingModule,
		ClipboardModule,
		RouterModule
	],
	exports: [SignupComponentDialogComponent, LoginComponentDialog, RequestPasswordDialogComponent, AddCardDialogComponent
		, VerifyIdDialogComponent, VerifyEmailDialogComponent, IdPolicyDialogComponent, VideoDialogComponent
		, VerifyPhoneDialogComponent, LiveSessionDialogComponent, CollectionGridDialogComponent, ProfilePopupCardComponent],
	declarations: [SignupComponentDialogComponent, LoginComponentDialog, RequestPasswordDialogComponent
		, AddCardDialogComponent, MultiselectTopicDialogComponent, VerifyIdDialogComponent, VerifyEmailDialogComponent
		, IdPolicyDialogComponent, VideoDialogComponent,
		VerifyPhoneDialogComponent, LiveSessionDialogComponent, CollectionGridDialogComponent, ProfilePopupCardComponent
		, ProfilePopupCardComponent, ExitCollectionDialogComponent, CancelCollectionDialogComponent, DeleteCollectionDialogComponent,
		EditCalendarDialogComponent,
		AddTopicDialogComponent,
		AddLanguageDialogComponent,
		ViewConflictDialogComponent, SelectDateDialogComponent,
		CollectionCloneDialogComponent, CollectionSubmitDialogComponent,
		SubmissionViewComponent,
		SubmitEntryComponent, ViewEntryDialogComponent, InviteFriendsDialogComponent, DeleteCohortDialogComponent,
		CancelCohortDialogComponent, ReportProfileComponent, RateParticipantComponent,
		ShareDialogComponent, DeleteCommunityDialogComponent, ExitCommunityDialogComponent,
		DateConflictDialogComponent, EditSubmissionDialogComponent, InboxDialogComponent, MessageParticipantDialogComponent,
		ViewParticipantsComponent, StudentAssessmentDialogComponent, GyanTransactionsDialogComponent,
		RequestCommunityDialogComponent,
		ScholarshipDialogComponent,
		GenerateKnowledgeStoryComponent,
		RequestKnowledgeStoryComponent,
		ConfirmPasswordDialogComponent,
		AddViewerDialogComponent,
		GyanPromptComponent,
		AddCommunityDialogComponent,
		CreateAccreditationDialogComponent,
		SelectFieldDialogComponent,
		CertificateVerificationComponent,
		CollectionStandardsDialogComponent,
		TermsAndConditionsDialogComponent,
		OnboardingDialogComponent,
		AddPromoCodeDialogComponent,
		ViewPromocodeDialogComponent,
		AddParticipantDialogComponent,
		ConfirmDeleteAccountComponent,
		AddImageDialogComponent,
		AskQuestionDialogComponent,
		SubmissionReviewDialogComponent,
		GenericPromptDialogComponent
	],
	providers: [
		DialogsService,
		TwilioServicesService,
		ProjectSubmissionService,
		SocialSharingService
	],
	entryComponents: [
		SignupComponentDialogComponent, LoginComponentDialog, RequestPasswordDialogComponent, AddCardDialogComponent,
		MultiselectTopicDialogComponent
		, VerifyIdDialogComponent, VerifyEmailDialogComponent, IdPolicyDialogComponent, VideoDialogComponent,
		VerifyPhoneDialogComponent
		, LiveSessionDialogComponent, CollectionGridDialogComponent, ProfilePopupCardComponent, CancelCollectionDialogComponent,
		ExitCollectionDialogComponent, DeleteCollectionDialogComponent,
		EditCalendarDialogComponent, AddTopicDialogComponent, AddLanguageDialogComponent, ViewConflictDialogComponent, SelectDateDialogComponent,
		CollectionCloneDialogComponent, CollectionSubmitDialogComponent, SubmissionViewComponent, SubmitEntryComponent, ViewEntryDialogComponent, InviteFriendsDialogComponent,
		CancelCohortDialogComponent, DeleteCohortDialogComponent, ReportProfileComponent, RateParticipantComponent,
		ShareDialogComponent, DeleteCommunityDialogComponent, ExitCommunityDialogComponent, DateConflictDialogComponent,
		EditSubmissionDialogComponent, InboxDialogComponent, MessageParticipantDialogComponent, ViewParticipantsComponent,
		StudentAssessmentDialogComponent, GyanTransactionsDialogComponent, RequestCommunityDialogComponent,
		ScholarshipDialogComponent, GenerateKnowledgeStoryComponent, RequestKnowledgeStoryComponent, ConfirmPasswordDialogComponent,
		AddViewerDialogComponent, GyanPromptComponent, AddCommunityDialogComponent, CreateAccreditationDialogComponent, SelectFieldDialogComponent,
		CertificateVerificationComponent, TermsAndConditionsDialogComponent, CollectionStandardsDialogComponent, OnboardingDialogComponent, AddPromoCodeDialogComponent,
		ViewPromocodeDialogComponent, AddParticipantDialogComponent, ConfirmDeleteAccountComponent, AddImageDialogComponent, AskQuestionDialogComponent, SubmissionReviewDialogComponent
		, GenericPromptDialogComponent
	],
})
export class DialogsModule { }
