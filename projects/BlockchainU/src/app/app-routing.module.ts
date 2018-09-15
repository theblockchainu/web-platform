import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './default/index/index.component';
import { NoContentComponent } from './no-content/no-content.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { LoginComponentDialog } from './_services/dialogs/login-dialog/login-dialog.component';
import { AppDesignComponent } from './app-design/app-design.component';
import { IndexPhilComponent } from './default/index-philosophy/index-philosophy.component';
import { GlobalErrorHandlerComponent } from './error-handler/globalerrorhandler';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ContactComponent } from './contact-us/contact-us.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { CareerComponent } from './career/career.component';
import { PolicyComponent } from './policy/policy.component';
import { TrustComponent } from './trust/trust.component';
import { PressComponent } from './press/press.component';
import { AuthGuardService } from './_services/auth-guard/auth-guard.service';
import { ShortreadComponent } from './shortread/shortread.component';
import { PrivatebetaComponent } from './privatebeta/privatebeta.component';
import { KnowledgeeconomyComponent } from './knowledgeeconomy/knowledgeeconomy.component';
import { TokenflowComponent } from './tokenflow/tokenflow.component';
import { WhitepaperComponent } from './whitepaper/whitepaper.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

const routes: Routes = [
	{
		path: '',
		component: IndexComponent,
		pathMatch: 'full'
	},
	{
		path: 'landing',
		component: LandingPageComponent,
		pathMatch: 'full'
	},
	{
		path: 'about',
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
		loadChildren: './digest/digest.module#DigestModule'
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
		path: 'signup-social',
		loadChildren: './signup-social/signup-social.module#SignupSocialModule'
	},
	{
		path: 'home',
		loadChildren: './home/home.module#HomeModule'
	},
	{
		path: 'shortread',
		component: ShortreadComponent
	},
	{
		path: 'shortpaper',
		component: ShortreadComponent
	},
	{
		path: 'privatebeta',
		component: PrivatebetaComponent
	},
	{
		path: 'knowledgeeconomy',
		component: KnowledgeeconomyComponent
	},
	{
		path: 'whitepaper',
		component: WhitepaperComponent
	},
	{
		path: 'tokenflow',
		component: TokenflowComponent
	},
	{
		path: 'console',
		loadChildren: './console/console.module#ConsoleModule',
		canActivateChild: [AuthGuardService]
	},
	{
		path: 'profile',
		loadChildren: './profile/profile.module#ProfileModule'
	},
	{
		path: 'experience',
		loadChildren: './experience/experience.module#ExperienceModule'
	},
	{
		path: 'class',
		loadChildren: './class/class.module#ClassModule'
	},
	{
		path: 'session',
		loadChildren: './session/session.module#SessionModule'
	},
	{
		path: 'guide',
		loadChildren: './guide/guide.module#GuideModule'
	},
	{
		path: 'community',
		loadChildren: './community/community.module#CommunityModule'
	},
	{
		path: 'verification',
		loadChildren: './verification/verification.module#VerificationModule',
		canActivateChild: [AuthGuardService]
	},
	{
		path: 'onboarding',
		loadChildren: './onboarding/onboarding.module#OnboardingModule',
		canActivateChild: [AuthGuardService]
	},
	{
		path: 'admin',
		loadChildren: './admin/admin.module#AdminModule',
		canActivateChild: [AuthGuardService]
	},
	{
		path: 'review-pay',
		loadChildren: './review-pay/review-pay.module#ReviewPayModule',
		canActivateChild: [AuthGuardService]
	},
	{
		path: 'scholarship',
		loadChildren: './scholarship/scholarship.module#ScholarshipModule'
	},
	{
		path: 'accreditation',
		loadChildren: './accreditation/accreditation.module#AccreditationModule'
	},
	{
		path: 'story',
		loadChildren: './knowledge-story/knowledge-story.module#KnowledgeStoryModule'
	},
	{
		path: 'certificate',
		loadChildren: './certificate/certificate.module#CertificateModule'
	},
	{
		path: 'sign-up',
		loadChildren: './sign-up/sign-up.module#SignUpModule'
	},
	{
		path: 'invite',
		loadChildren: './invite/invite.module#InviteModule'
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
	imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
	exports: [RouterModule],
	providers: [LoginComponentDialog]
})
export class AppRoutingModule { }
