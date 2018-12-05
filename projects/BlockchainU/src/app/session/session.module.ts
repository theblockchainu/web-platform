import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SessionRoutingModule } from './session-routing.module';
import { SessionEditComponent } from './session-edit/session-edit.component';

import { SharedModule } from '../_shared/_shared.module';
import { BookSessionComponent } from './book-session/book-session.component';
import { ProcessSessionPaymentComponent } from './process-session-payment/process-session-payment.component';
import { StripePaymentComponent } from './stripe-payment/stripe-payment.component';
import { CcavenuePaymentComponent } from './ccavenue-payment/ccavenue-payment.component';
import { LiveSessionComponent } from './live-session/live-session.component';
@NgModule({
  imports: [
    CommonModule,
    SessionRoutingModule,
    SharedModule
  ],
  declarations: [
    SessionEditComponent,
    BookSessionComponent,
    ProcessSessionPaymentComponent,
    StripePaymentComponent,
    CcavenuePaymentComponent,
    LiveSessionComponent]
})
export class SessionModule { }
