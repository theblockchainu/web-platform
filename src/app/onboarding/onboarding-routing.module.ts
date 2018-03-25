import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';

import { OnboardingComponent } from './onboarding.component';

const routes: Routes = [
{
  path: '',
  children: [
    {
      path: ':step',
      component: OnboardingComponent,
      canActivateChild: [AuthGuardService]
    }

  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule { }
