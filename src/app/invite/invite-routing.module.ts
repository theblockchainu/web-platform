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
    path: ':provider',
    component: InviteComponent,
    canActivate: [AuthGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InviteRoutingModule { }
