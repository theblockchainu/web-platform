import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClassPageComponent } from './class-page.component';
import { AuthGuardService } from '../../_services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: ClassPageComponent
  },
  {
    path: 'calendar/:calendarId',
    component: ClassPageComponent,
    canActivateChild: [AuthGuardService]
  },
  {
    path: 'calendar/:calendarId/:dialogName',
    component: ClassPageComponent,
    canActivateChild: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClassPageRoutingModule { }
