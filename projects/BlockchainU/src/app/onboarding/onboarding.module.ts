import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OnboardingRoutingModule } from './onboarding-routing.module';
import { OnboardingComponent } from './onboarding.component';

import { SharedModule } from '../_shared/_shared.module';

@NgModule({
  imports: [
    CommonModule,
    OnboardingRoutingModule,
    SharedModule
  ],
  declarations: [OnboardingComponent]
})
export class OnboardingModule { }
