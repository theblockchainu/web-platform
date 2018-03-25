import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile.component';

import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import { AuthService } from '../_services/auth/auth.service';

const routes: Routes = [
  {
    path: ':profileId',
    children: [
      {
        path: '',
        component: ProfileComponent,
        pathMatch: 'full',
        canActivateChild: [AuthGuardService]
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
