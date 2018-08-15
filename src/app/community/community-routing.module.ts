import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import {CommunityEditComponent} from './community-edit/community-edit.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':communityId',
        loadChildren: './community-page/community-page.module#CommunityPageModule'
      },
      {
        path: ':communityId/edit/:step',
        component: CommunityEditComponent,
        canActivateChild: [AuthGuardService]
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunityRoutingModule { }
