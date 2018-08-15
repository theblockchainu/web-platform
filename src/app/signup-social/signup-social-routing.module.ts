import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupSocialComponent } from './signup-social.component';

import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import { AuthService } from '../_services/auth/auth.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SignupSocialComponent,
        pathMatch: 'full',
        canActivateChild: [AuthGuardService]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignupSocialRoutingModule { }
