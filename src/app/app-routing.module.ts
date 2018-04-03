import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './default/index/index.component';
import { NoContentComponent } from './no-content/no-content.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { LoginComponentDialog } from './_services/dialogs/login-dialog/login-dialog.component';
import { LoginComponent } from './login/login.component';
import { AppDesignComponent } from './app-design/app-design.component';
import { IndexPhilComponent } from './default/index-philosophy/index-philosophy.component';
import { GlobalErrorHandlerComponent } from './error-handler/globalerrorhandler';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ContactComponent } from './contact-us/contact-us.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { WhitePaperComponent } from './white-paper/white-paper.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { CareerComponent } from './career/career.component';
import { PolicyComponent } from './policy/policy.component';
import { TrustComponent } from './trust/trust.component';
import { PressComponent } from './press/press.component';
import {AuthGuardService} from './_services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent,
    pathMatch: 'full'
  },
  {
    path: 'about-us',
    component: AboutUsComponent
  },
  {
    path: 'career',
    component: CareerComponent
  },
  {
    path: 'press',
    component: PressComponent
  },
  {
    path: 'policy',
    component: PolicyComponent
  },
  {
    path: 'trust',
    component: TrustComponent
  },
  {
    path: 'digest',
    loadChildren: 'app/digest/digest.module#DigestModule'
  },
  {
    path: 'white-paper',
    component: WhitePaperComponent
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
  },
  {
    path: 'terms-of-service',
    component: TermsOfServiceComponent
  },
  {
    path: 'philosophy',
    component: IndexPhilComponent
  },
  {
    path: 'contact-us',
    component: ContactComponent
  },
  {
    path: 'design',
    component: AppDesignComponent
  },
  {
    path: 'login',
    component: IndexComponent
  },
  {
    path: 'reset',
    component: ResetPasswordComponent
  },
  {
    path: 'login1',
    component: LoginComponent
  },
  {
    path: 'signup-social',
    loadChildren: 'app/signup-social/signup-social.module#SignupSocialModule'
  },
  {
    path: 'home',
    loadChildren: 'app/home/home.module#HomeModule'
  },
  {
    path: 'console',
    loadChildren: 'app/console/console.module#ConsoleModule',
	  canActivateChild: [AuthGuardService]
  },
  {
    path: 'profile',
    loadChildren: 'app/profile/profile.module#ProfileModule'
  },
  {
    path: 'experience',
    loadChildren: 'app/experience/experience.module#ExperienceModule'
  },
  {
    path: 'workshop',
    loadChildren: 'app/workshop/workshop.module#WorkshopModule'
  },
  {
    path: 'session',
    loadChildren: 'app/session/session.module#SessionModule'
  },
  {
    path: 'community',
    loadChildren: 'app/community/community.module#CommunityModule'
  },
  {
    path: 'app-upload-docs',
    loadChildren: 'app/verification/verification.module#VerificationModule',
	  canActivateChild: [AuthGuardService]
  },
  {
    path: 'onboarding',
    loadChildren: 'app/onboarding/onboarding.module#OnboardingModule',
	  canActivateChild: [AuthGuardService]
  },
  {
    path: 'admin',
    loadChildren: 'app/admin/admin.module#AdminModule',
	  canActivateChild: [AuthGuardService]
  },
  {
    path: 'review-pay',
    loadChildren: 'app/review-pay/review-pay.module#ReviewPayModule',
	  canActivateChild: [AuthGuardService]
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },
  {
    path: 'error',
    component: GlobalErrorHandlerComponent
  },
  {
    path: '**',
    component: NoContentComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [LoginComponentDialog]
})
export class AppRoutingModule { }
