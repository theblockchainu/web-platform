import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import { ContentPageComponent } from './content-page/content-page.component';
const routes: Routes = [
  {
    path: ':contentId',
    component: ContentPageComponent,
    canActivateChild: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule { }

