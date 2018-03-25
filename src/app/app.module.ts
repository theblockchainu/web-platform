import {BrowserModule, Title} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';


import { AppComponent } from './app.component';
import {AppNotificationDialogComponent} from './app-header/dialogs/app-notification-dialog/app-notification-dialog.component';
import {GlobalErrorHandlerComponent} from './error-handler/globalerrorhandler';
import {DefaultModule} from './default/default.module';
import {AppRoutingModule} from './app-routing.module';
import {DialogsModule} from './_services/dialogs/dialogs.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppFooterModule} from './app-footer/app-footer.module';
import {CoreModule} from './_core/_core.module';
import {TrustComponent} from './trust/trust.component';
import {PolicyComponent} from './policy/policy.component';
import {PressComponent} from './press/press.component';
import {CareerComponent} from './career/career.component';
import {TermsOfServiceComponent} from './terms-of-service/terms-of-service.component';
import {PrivacyPolicyComponent} from './privacy-policy/privacy-policy.component';
import {WhitePaperComponent} from './white-paper/white-paper.component';
import {AboutUsComponent} from './about-us/about-us.component';
import {ContactComponent} from './contact-us/contact-us.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {AppDesignComponent} from './app-design/app-design.component';
import {SignupComponent} from './signup/signup.component';
import {LoginComponent} from './login/login.component';
import {AppHeaderComponent} from './app-header/app-header.component';
import {AccessDeniedComponent} from './access-denied/access-denied.component';
import {NoContentComponent} from './no-content/no-content.component';
import {DefaultComponent} from './default/default.component';
import {
  MatAutocompleteModule, MatCardModule, MatIconModule, MatInputModule, MatMenuModule, MatNativeDateModule,
  MatToolbarModule, MatProgressBarModule,
  MatProgressSpinnerModule,
} from '@angular/material';
import {MatListModule} from '@angular/material';
import {MatButtonModule} from '@angular/material';
import {MatTooltipModule} from '@angular/material';
import {ANIMATION_TYPES, LoadingModule} from 'ngx-loading';
import {CookieService} from 'ngx-cookie-service';


@NgModule({
  declarations: [
    AppComponent,
    DefaultComponent,
    NoContentComponent,
    AppHeaderComponent,
    AccessDeniedComponent,
    LoginComponent,
    SignupComponent,
    AppDesignComponent,
    GlobalErrorHandlerComponent,
    AppNotificationDialogComponent,
    ResetPasswordComponent,
    ContactComponent,
    AboutUsComponent,
    WhitePaperComponent,
    PrivacyPolicyComponent,
    TermsOfServiceComponent,
    CareerComponent,
    PressComponent,
    PolicyComponent,
    TrustComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    AppFooterModule,
    BrowserAnimationsModule,
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
    DialogsModule,
    AppRoutingModule,
    DefaultModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.threeBounce,
      backdropBackgroundColour: 'rgba(0,0,0,0)',
      backdropBorderRadius: '0px',
      primaryColour: '#33bd9e',
      secondaryColour: '#ff5b5f',
      tertiaryColour: '#ff6d71'
    })
  ],
  providers: [
    CookieService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerComponent
    },
    Title
  ],
  bootstrap: [AppComponent],
  entryComponents: [AppNotificationDialogComponent]
})
export class AppModule { }
