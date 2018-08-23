import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CertificateRoutingModule } from './certificate-routing.module';
import { CertificatePageComponent } from './certificate-page/certificate-page.component';
import { SharedModule } from '../_shared/_shared.module';
@NgModule({
  imports: [
    CommonModule,
    CertificateRoutingModule,
    SharedModule
  ],
  declarations: [CertificatePageComponent]
})
export class CertificateModule { }
