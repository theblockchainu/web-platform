import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SessionEditComponent } from './session-edit/session-edit.component';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';
import { BookSessionComponent } from './book-session/book-session.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'book/:peerId',
        component: BookSessionComponent,
        canActivateChild: [AuthGuardService]
      },
      {
        path: ':collectionId/edit/:step',
        component: SessionEditComponent,
        canActivateChild: [AuthGuardService]
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionRoutingModule { }
