import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignUpRoutingModule } from './sign-up-routing.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import { SharedModule } from '../_shared/_shared.module';
import { SocialSharingService } from '../_services/social-sharing/social-sharing.service';
@NgModule({
  imports: [
    CommonModule,
    SignUpRoutingModule,
    SharedModule
  ],
  providers: [SocialSharingService],
  declarations: [SignUpComponent]
})
export class SignUpModule { }
