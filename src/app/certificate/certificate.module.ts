import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CertificateRoutingModule } from './certificate-routing.module';
import { CertificatePageComponent } from './certificate-page/certificate-page.component';

@NgModule({
  imports: [
    CommonModule,
    CertificateRoutingModule
  ],
  declarations: [CertificatePageComponent]
})
export class CertificateModule { }
