import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuidePageComponent } from './guide-page.component';
import { AuthGuardService } from '../../_services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: GuidePageComponent
  },
  {
    path: ':dialogName',
    component: GuidePageComponent,
    canActivateChild: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuidePageRoutingModule { }
