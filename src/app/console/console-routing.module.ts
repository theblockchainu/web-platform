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
import { ConsoleTeachingWorkshopComponent } from './console-teaching/console-teaching-workshop/console-teaching-workshop.component';
import { ConsoleTeachingExperienceComponent } from './console-teaching/console-teaching-experience/console-teaching-experience.component';
import { ConsoleTeachingSessionComponent } from './console-teaching/console-teaching-session/console-teaching-session.component';
import { ConsoleLearningAllComponent } from './console-learning/console-learning-all/console-learning-all.component';
import { ConsoleLearningWorkshopsComponent } from './console-learning/console-learning-workshops/console-learning-workshops.component';
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
import {ContentLearningBookmarksComponent} from './console-learning/content-learning-bookmarks/content-learning-bookmarks.component';

const routes: Routes = [{
  path: '',
  component: ConsoleComponent,
  canActivate: [AuthGuardService],
  children: [
    {
      path: 'dashboard',
      component: ConsoleDashboardComponent
    },
    {
      path: 'inbox',
      component: ConsoleInboxComponent
    },
    {
      path: 'learning',
      component: ConsoleLearningComponent,
      children: [
        {
          path: 'all',
          component: ConsoleLearningAllComponent
        },
        {
          path: 'workshops',
          component: ConsoleLearningWorkshopsComponent
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
          path: 'sessions',
          component: ConsoleLearningSessionsComponent
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
      children: [
        {
          path: 'all',
          component: ConsoleTeachingAllComponent
        },
        {
          path: 'workshops',
          component: ConsoleTeachingWorkshopComponent
        },
        {
          path: 'experiences',
          component: ConsoleTeachingExperienceComponent
        },
        {
          path: 'sessions',
          component: ConsoleTeachingSessionComponent
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
          path: '',
          component: ConsoleAccountNotificationsComponent
        }
      ]
    },
    {
      path: 'admin',
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
