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
        path: 'book/:peerId/:mode/:contentId',
        component: BookSessionComponent,
        canActivate: [AuthGuardService]
      },
		{
			path: 'book/:peerId',
			component: BookSessionComponent,
			canActivate: [AuthGuardService]
		},
      {
        path: ':collectionId/edit/:step',
        component: SessionEditComponent,
        canActivate: [AuthGuardService]
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes, {ScrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class SessionRoutingModule { }
