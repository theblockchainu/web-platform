import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import { InviteComponent } from './invite.component';

const routes: Routes = [
  {
    path: '',
    component: InviteComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':stepId',
    component: InviteComponent,
    canActivate: [AuthGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes, {ScrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class InviteRoutingModule { }
