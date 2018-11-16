import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../_shared/_shared.module';
import { ConsoleRoutingModule } from './console-routing.module';
import { ConsoleComponent } from './console.component';
import {
	MatButtonModule, MatCardModule, MatMenuModule, MatToolbarModule, MatIconModule
	, MatProgressBarModule, MatListModule, MatTabsModule, MatChipsModule, MatInputModule
	, MatSelectModule, MatSnackBarModule, MatAutocompleteModule
} from '@angular/material';
import { RatingModule } from 'primeng/primeng';
import { ConsoleDashboardComponent } from './console-dashboard/console-dashboard.component';
import { ConsoleInboxComponent } from './console-inbox/console-inbox.component';
import { ConsoleLearningComponent } from './console-learning/console-learning.component';
import { ConsoleTeachingComponent } from './console-teaching/console-teaching.component';
import { ConsoleProfileComponent } from './console-profile/console-profile.component';
import { ConsoleAccountComponent } from './console-account/console-account.component';
import { ConsoleTeachingClassComponent } from './console-teaching/console-teaching-class/console-teaching-class.component';
import { ConsoleTeachingExperienceComponent } from './console-teaching/console-teaching-experience/console-teaching-experience.component';
import { ConsoleTeachingSessionComponent } from './console-teaching/console-teaching-session/console-teaching-session.component';
import { ConsoleTeachingAllComponent } from './console-teaching/console-teaching-all/console-teaching-all.component';
import { ConsoleLearningAllComponent } from './console-learning/console-learning-all/console-learning-all.component';
import { ConsoleLearningClassesComponent } from './console-learning/console-learning-classes/console-learning-classes.component';
import { ConsoleLearningExperiencesComponent } from './console-learning/console-learning-experiences/console-learning-experiences.component';
import { ConsoleLearningSessionsComponent } from './console-learning/console-learning-sessions/console-learning-sessions.component';
import { ConsoleProfileEditComponent } from './console-profile/console-profile-edit/console-profile-edit.component';
import { ConsoleProfilePhotosComponent } from './console-profile/console-profile-photos/console-profile-photos.component';
import { ConsoleProfileTopicsComponent } from './console-profile/console-profile-topics/console-profile-topics.component';
import { ConsoleProfileVerificationComponent } from './console-profile/console-profile-verification/console-profile-verification.component';
import { ConsoleProfileReviewsComponent } from './console-profile/console-profile-reviews/console-profile-reviews.component';
import { ConsoleAccountNotificationsComponent } from './console-account/console-account-notifications/console-account-notifications.component';
import { ConsoleAccountPaymentmethodsComponent } from './console-account/console-account-paymentmethods/console-account-paymentmethods.component';
import { ConsoleAccountPayoutmethodsComponent } from './console-account/console-account-payoutmethods/console-account-payoutmethods.component';
import { ConsoleAccountTransactionhistoryComponent } from './console-account/console-account-transactionhistory/console-account-transactionhistory.component';
import { ConsoleAccountSecurityComponent } from './console-account/console-account-security/console-account-security.component';
import { ConsoleAccountPrivacyComponent } from './console-account/console-account-privacy/console-account-privacy.component';
import { ConsoleAccountSettingsComponent } from './console-account/console-account-settings/console-account-settings.component';
import { TimezonePickerService } from '../_services/timezone-picker/timezone-picker.service';
import { CohortDetailDialogComponent } from './console-teaching/console-teaching-class/cohort-detail-dialog/cohort-detail-dialog.component';
import { ConsoleAdminComponent } from './console-admin/console-admin.component';
import { ContentLearningBookmarksComponent } from './console-learning/content-learning-bookmarks/content-learning-bookmarks.component';
import { ConsoleAccountWalletComponent } from './console-account/console-account-wallet/console-account-wallet.component';
import { ConsoleAccountScholarshipsComponent } from './console-account/console-account-scholarships/console-account-scholarships.component';
import { ConsoleLearningKnowledgeStoryComponent } from './console-learning/console-learning-knowledge-story/console-learning-knowledge-story.component';
import { ConsoleTeachingAccreditationComponent } from './console-teaching/console-teaching-accreditation/console-teaching-accreditation.component';
import { ConsoleTeachingGuideComponent } from './console-teaching/console-teaching-guide/console-teaching-guide.component';
import { ConsoleTeachingBountyComponent } from './console-teaching/console-teaching-bounty/console-teaching-bounty.component';
import { ConsoleLearningBountiesComponent } from './console-learning/console-learning-bounty/console-learning-bounties.component';
import { ConsoleLearningGuidesComponent } from './console-learning/console-learning-guides/console-learning-guides.component';
import { ConsoleTeachingLearningPathComponent } from './console-teaching/console-teaching-learning-path/console-teaching-learning-path.component';
@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		ConsoleRoutingModule,
		RatingModule,
		MatCardModule,
		MatButtonModule,
		MatMenuModule,
		MatToolbarModule,
		MatIconModule,
		MatProgressBarModule,
		MatListModule,
		MatTabsModule,
		MatChipsModule,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule,
		MatAutocompleteModule
	],
	declarations: [
		ConsoleComponent,
		ConsoleDashboardComponent,
		ConsoleInboxComponent,
		ConsoleLearningComponent,
		ConsoleTeachingComponent,
		ConsoleProfileComponent,
		ConsoleAccountComponent,
		ConsoleTeachingClassComponent,
		ConsoleTeachingExperienceComponent,
		ConsoleTeachingSessionComponent,
		ConsoleTeachingAllComponent,
		ConsoleLearningAllComponent,
		ConsoleLearningClassesComponent,
		ConsoleLearningExperiencesComponent,
		ConsoleLearningSessionsComponent,
		ConsoleProfileEditComponent,
		ConsoleProfilePhotosComponent,
		ConsoleProfileTopicsComponent,
		ConsoleProfileVerificationComponent,
		ConsoleProfileReviewsComponent,
		ConsoleAccountNotificationsComponent,
		ConsoleAccountPaymentmethodsComponent,
		ConsoleAccountPayoutmethodsComponent,
		ConsoleAccountTransactionhistoryComponent,
		ConsoleAccountSecurityComponent,
		ConsoleAccountPrivacyComponent,
		ConsoleAccountSettingsComponent,
		CohortDetailDialogComponent,
		ConsoleAdminComponent,
		ContentLearningBookmarksComponent,
		ConsoleAccountWalletComponent,
		ConsoleAccountScholarshipsComponent,
		ConsoleLearningKnowledgeStoryComponent,
		ConsoleTeachingAccreditationComponent,
		ConsoleTeachingGuideComponent,
		ConsoleTeachingBountyComponent,
		ConsoleLearningBountiesComponent,
		ConsoleLearningGuidesComponent,
		ConsoleLearningGuidesComponent,
		ConsoleTeachingLearningPathComponent
	],
	providers: [TimezonePickerService],
	bootstrap: [CohortDetailDialogComponent]
})
export class ConsoleModule { }
