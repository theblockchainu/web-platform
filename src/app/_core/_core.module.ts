import { ModuleWithProviders, NgModule, Optional, SkipSelf, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from '../_services/authentication/authentication.service';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import { AuthService } from '../_services/auth/auth.service';
import { AlertService } from '../_services/alert/alert.service';
import { FormsModule, ReactiveFormsModule, NgModel } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProfileService } from '../_services/profile/profile.service';
import { PaymentService } from '../_services/payment/payment.service';
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  exports: [
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthGuardService,
    AuthService,
    AlertService,
    AuthenticationService,
    ProfileService,
    PaymentService
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
