import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignupSocialRoutingModule } from './signup-social-routing.module';
import { SignupSocialComponent } from './signup-social.component';
import { SharedModule } from '../_shared/_shared.module';

@NgModule({
  imports: [
    CommonModule,
    SignupSocialRoutingModule,
    SharedModule
  ],
  declarations: [SignupSocialComponent]
})
export class SignupSocialModule { }
