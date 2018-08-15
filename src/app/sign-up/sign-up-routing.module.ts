import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignUpComponent } from './sign-up/sign-up.component';
const routes: Routes = [
  {
    path: '',
    component: SignUpComponent
  },
  {
    path: ':invitationId',
    component: SignUpComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes, {ScrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class SignUpRoutingModule { }
