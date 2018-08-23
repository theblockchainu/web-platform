import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReviewPayComponent } from './review-pay.component';

import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import { AuthService } from '../_services/auth/auth.service';

const routes: Routes = [
  {
    path: 'collection/:collectionId/:calendarId',
    component: ReviewPayComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReviewPayRoutingModule { }
