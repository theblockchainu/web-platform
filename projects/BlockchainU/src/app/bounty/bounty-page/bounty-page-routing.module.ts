import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BountyPageComponent } from './bounty-page.component';
import { AuthGuardService } from '../../_services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: BountyPageComponent
  },
  {
    path: 'calendar/:calendarId',
    component: BountyPageComponent,
    canActivateChild: [AuthGuardService]
  },
  {
    path: 'calendar/:calendarId/:dialogName',
    component: BountyPageComponent,
    canActivateChild: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BountyPageRoutingModule { }
