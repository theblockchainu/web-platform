import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExperienceEditComponent } from './experience-edit/experience-edit.component';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import { AuthService } from '../_services/auth/auth.service';
import { ExperiencePageComponent } from './experience-page/experience-page.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':collectionId',
        loadChildren: './experience-page/experience-page.module#ExperiencePageModule'
      },
      {
        path: ':collectionId/edit/:step',
        component: ExperienceEditComponent,
        canActivateChild: [AuthGuardService]
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExperienceRoutingModule { }
