import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import { ConsoleComponent } from './console.component';
import { ConsoleDashboardComponent } from './console-dashboard/console-dashboard.component';
import { ConsoleInboxComponent } from './console-inbox/console-inbox.component';
import { ConsoleLearningComponent } from './console-learning/console-learning.component';
import { ConsoleTeachingComponent } from './console-teaching/console-teaching.component';
import { ConsoleProfileComponent } from './console-profile/console-profile.component';
import { ConsoleAccountComponent } from './console-account/console-account.component';
import { ConsoleTeachingAllComponent } from './console-teaching/console-teaching-all/console-teaching-all.component';
import { ConsoleTeachingClassComponent } from './console-teaching/console-teaching-class/console-teaching-class.component';
import { ConsoleTeachingExperienceComponent } from './console-teaching/console-teaching-experience/console-teaching-experience.component';
import { ConsoleTeachingSessionComponent } from './console-teaching/console-teaching-session/console-teaching-session.component';
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

const routes: Routes = [{
	path: '',
	component: ConsoleComponent,
	canActivate: [AuthGuardService],
	children: [
		{
			path: 'dashboard',
			component: ConsoleDashboardComponent,
			canActivate: [AuthGuardService]
		},
		{
			path: 'inbox',
			component: ConsoleInboxComponent,
			canActivate: [AuthGuardService]
		},
		{
			path: 'inbox/:roomId',
			component: ConsoleInboxComponent,
			canActivate: [AuthGuardService]
		},
		{
			path: 'learning',
			component: ConsoleLearningComponent,
			canActivate: [AuthGuardService],
			children: [
				{
					path: 'all',
					component: ConsoleLearningAllComponent
				},
				{
					path: 'classes',
					component: ConsoleLearningClassesComponent
				},
				{
					path: 'experiences',
					component: ConsoleLearningExperiencesComponent
				},
				{
					path: 'bookmarks',
					component: ContentLearningBookmarksComponent
				},
				{
					path: 'story',
					component: ConsoleLearningKnowledgeStoryComponent
				},
				{
					path: 'sessions',
					component: ConsoleLearningSessionsComponent
				},
				{
					path: 'bounties',
					component: ConsoleLearningBountiesComponent
				},
				{
					path: 'guides',
					component: ConsoleLearningGuidesComponent
				},
				{
					path: '',
					component: ConsoleLearningAllComponent
				}
			]
		},
		{
			path: 'teaching',
			component: ConsoleTeachingComponent,
			canActivate: [AuthGuardService],
			children: [
				{
					path: 'all',
					component: ConsoleTeachingAllComponent
				},
				{
					path: 'classes',
					component: ConsoleTeachingClassComponent
				},
				{
					path: 'experiences',
					component: ConsoleTeachingExperienceComponent
				},
				{
					path: 'bounties',
					component: ConsoleTeachingBountyComponent
				},
				{
					path: 'sessions',
					component: ConsoleTeachingSessionComponent
				},
				{
					path: 'accreditations',
					component: ConsoleTeachingAccreditationComponent
				},
				{
					path: 'guides',
					component: ConsoleTeachingGuideComponent
				},
				{
					path: 'learning-paths',
					component: ConsoleTeachingLearningPathComponent
				},
				{
					path: '',
					component: ConsoleTeachingAllComponent
				}
			]
		},
		{
			path: 'profile',
			component: ConsoleProfileComponent,
			canActivate: [AuthGuardService],
			children: [
				{
					path: 'edit',
					component: ConsoleProfileEditComponent
				},
				{
					path: 'photos',
					component: ConsoleProfilePhotosComponent
				},
				{
					path: 'topics',
					component: ConsoleProfileTopicsComponent
				},
				{
					path: 'verification',
					component: ConsoleProfileVerificationComponent
				},
				{
					path: 'reviews',
					component: ConsoleProfileReviewsComponent
				},
				{
					path: '',
					component: ConsoleProfileEditComponent
				}
			]
		},
		{
			path: 'account',
			component: ConsoleAccountComponent,
			canActivate: [AuthGuardService],
			children: [
				{
					path: 'notifications',
					component: ConsoleAccountNotificationsComponent
				},
				{
					path: 'paymentmethods',
					component: ConsoleAccountPaymentmethodsComponent
				},
				{
					path: 'payoutmethods',
					component: ConsoleAccountPayoutmethodsComponent
				},
				{
					path: 'transactions',
					component: ConsoleAccountTransactionhistoryComponent
				},
				{
					path: 'security',
					component: ConsoleAccountSecurityComponent
				},
				{
					path: 'privacy',
					component: ConsoleAccountPrivacyComponent
				},
				{
					path: 'settings',
					component: ConsoleAccountSettingsComponent
				},
				{
					path: 'wallet',
					component: ConsoleAccountWalletComponent
				},
				{
					path: 'scholarships',
					component: ConsoleAccountScholarshipsComponent
				},
				{
					path: '',
					component: ConsoleAccountNotificationsComponent
				}
			]
		},
		{
			path: 'admin',
			canActivate: [AuthGuardService],
			component: ConsoleAdminComponent
		}
	]
}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ConsoleRoutingModule {

}
