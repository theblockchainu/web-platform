import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExperiencePageComponent } from './experience-page.component';
import { AuthGuardService } from '../../_services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: ExperiencePageComponent
  },
  {
    path: 'calendar/:calendarId',
    component: ExperiencePageComponent,
    canActivateChild: [AuthGuardService]
  },
  {
    path: 'calendar/:calendarId/:dialogName',
    component: ExperiencePageComponent,
    canActivateChild: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExperiencePageRoutingModule { }
