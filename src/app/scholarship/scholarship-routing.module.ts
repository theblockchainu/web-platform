import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SholarshipPageComponent } from './sholarship-page/sholarship-page.component';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':scholarshipId',
        component: SholarshipPageComponent,
        canActivateChild: [AuthGuardService]
      }

    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScholarshipRoutingModule { }
