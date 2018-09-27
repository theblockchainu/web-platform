import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BountyEditComponent } from './bounty-edit/bounty-edit.component';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import { AuthService } from '../_services/auth/auth.service';
import { BountyPageComponent } from './bounty-page/bounty-page.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':collectionId',
        loadChildren: './bounty-page/bounty-page.module#BountyPageModule'
      },
      {
        path: ':collectionId/edit/:step',
        component: BountyEditComponent,
        canActivate: [AuthGuardService]
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BountyRoutingModule { }
