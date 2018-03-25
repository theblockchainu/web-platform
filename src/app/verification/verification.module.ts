import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerificationRoutingModule } from './verification-routing.module';
import { UploadDocsComponent } from './upload-docs/upload-docs.component';
import { SharedModule } from '../_shared/_shared.module';

@NgModule({
  imports: [
    CommonModule,
    VerificationRoutingModule,
    SharedModule
  ],
  declarations: [UploadDocsComponent]
})
export class VerificationModule { }
