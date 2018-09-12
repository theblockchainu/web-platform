import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuideEditComponent } from './guide-edit/guide-edit.component';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import { AuthService } from '../_services/auth/auth.service';
import { GuidePageComponent } from './guide-page/guide-page.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':collectionId',
        loadChildren: './guide-page/guide-page.module#GuidePageModule'
      },
      {
        path: ':collectionId/edit/:step',
        component: GuideEditComponent,
        canActivate: [AuthGuardService]
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GuideRoutingModule { }
