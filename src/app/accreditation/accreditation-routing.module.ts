import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccreditationPageComponent } from './accreditation-page/accreditation-page.component';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':accreditationId',
        component: AccreditationPageComponent,
        canActivateChild: [AuthGuardService]
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes, {ScrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AccreditationRoutingModule { }
