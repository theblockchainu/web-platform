import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkshopPageComponent } from './workshop-page.component';
import { AuthGuardService } from '../../_services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: WorkshopPageComponent
  },
  {
    path: 'calendar/:calendarId',
    component: WorkshopPageComponent,
    canActivateChild: [AuthGuardService]
  },
  {
    path: 'calendar/:calendarId/:dialogName',
    component: WorkshopPageComponent,
    canActivateChild: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkshopPageRoutingModule { }
