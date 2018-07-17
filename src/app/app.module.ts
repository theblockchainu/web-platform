import { BrowserModule, Meta, Title } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppNotificationDialogComponent } from './app-header/dialogs/app-notification-dialog/app-notification-dialog.component';
import { GlobalErrorHandlerComponent } from './error-handler/globalerrorhandler';
import { DefaultModule } from './default/default.module';
import { AppRoutingModule } from './app-routing.module';
import { DialogsModule } from './_services/dialogs/dialogs.module';
import { AppFooterModule } from './app-footer/app-footer.module';
import { CoreModule } from './_core/_core.module';
import { TrustComponent } from './trust/trust.component';
import { PolicyComponent } from './policy/policy.component';
import { PressComponent } from './press/press.component';
import { CareerComponent } from './career/career.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactComponent } from './contact-us/contact-us.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AppDesignComponent } from './app-design/app-design.component';
import { LoginComponent } from './login/login.component';
import { AppHeaderComponent } from './app-header/app-header.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { NoContentComponent } from './no-content/no-content.component';
import { DefaultComponent } from './default/default.component';
import {
	MatAutocompleteModule, MatCardModule, MatIconModule, MatInputModule, MatMenuModule, MatNativeDateModule,
	MatToolbarModule, MatProgressBarModule,
	MatProgressSpinnerModule,
} from '@angular/material';
import { MatListModule } from '@angular/material';
import { MatButtonModule } from '@angular/material';
import { MatTooltipModule } from '@angular/material';
import { ANIMATION_TYPES, LoadingModule } from 'ngx-loading';
import { CookieService } from 'ngx-cookie-service';
import { UcWordsPipe } from 'ngx-pipes';
import * as Raven from 'raven-js';
import { environment } from '../environments/environment';
import { TokenflowComponent } from './tokenflow/tokenflow.component';
import { WhitepaperComponent } from './whitepaper/whitepaper.component';
import { KnowledgeeconomyComponent } from './knowledgeeconomy/knowledgeeconomy.component';
import { ShortreadComponent } from './shortread/shortread.component';
import { PrivatebetaComponent } from './privatebeta/privatebeta.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { LandingPageModule } from './landing-page/landing-page.module';
import { SharedModule } from './_shared/_shared.module';


// Raven
// 	.config('https://6c6efc37493d4ff2974b8b4a506c670a@sentry.io/289434')
// 	.install();

// Raven.setExtraContext({
// 	environment: (environment.production) ? 'production' : 'development'
// });

// export class RavenErrorHandler implements ErrorHandler {
// 	handleError(err: any): void {
// 		Raven.captureException(err);
// 	}
// }


@NgModule({
	declarations: [
		AppComponent,
		DefaultComponent,
		NoContentComponent,
		AppHeaderComponent,
		AccessDeniedComponent,
		LoginComponent,
		AppDesignComponent,
		GlobalErrorHandlerComponent,
		AppNotificationDialogComponent,
		ResetPasswordComponent,
		ContactComponent,
		AboutUsComponent,
		PrivacyPolicyComponent,
		TermsOfServiceComponent,
		CareerComponent,
		PressComponent,
		PolicyComponent,
		TrustComponent,
		TokenflowComponent,
		WhitepaperComponent,
		KnowledgeeconomyComponent,
		ShortreadComponent,
		PrivatebetaComponent
	],
	imports: [
		BrowserModule,
		CoreModule,
		DialogsModule,
		AppRoutingModule,
		DefaultModule,
		AppFooterModule,
		MatCardModule,
		MatButtonModule,
		MatMenuModule,
		MatToolbarModule,
		MatIconModule,
		MatAutocompleteModule,
		MatInputModule,
		MatNativeDateModule,
		MatProgressSpinnerModule,
		MatProgressBarModule,
		MatTooltipModule,
		MatListModule,
		PdfViewerModule,
		LoadingModule.forRoot({
			animationType: ANIMATION_TYPES.threeBounce,
			backdropBackgroundColour: 'rgba(0,0,0,0)',
			backdropBorderRadius: '0px',
			primaryColour: '#33bd9e',
			secondaryColour: '#ff5b5f',
			tertiaryColour: '#ff6d71'
		}),
		LandingPageModule,
		SharedModule
	],
	providers: [
		CookieService,
		UcWordsPipe,
		// {
		// 	provide: ErrorHandler,
		// 	useClass: RavenErrorHandler
		// },
		Title,
		Meta
	],
	bootstrap: [AppComponent],
	entryComponents: [AppNotificationDialogComponent]
})
export class AppModule { }
