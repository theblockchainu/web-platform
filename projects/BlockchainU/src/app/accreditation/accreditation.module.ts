import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccreditationRoutingModule } from './accreditation-routing.module';
import { AccreditationPageComponent } from './accreditation-page/accreditation-page.component';
import { SharedModule } from '../_shared/_shared.module';
@NgModule({
  imports: [
    CommonModule,
    AccreditationRoutingModule,
    SharedModule
  ],
  declarations: [AccreditationPageComponent]
})
export class AccreditationModule { }
