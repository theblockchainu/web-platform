import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CertificatePageComponent } from './certificate-page/certificate-page.component';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':certificateId',
        component: CertificatePageComponent,
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CertificateRoutingModule { }
