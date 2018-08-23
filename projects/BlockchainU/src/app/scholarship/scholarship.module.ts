import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScholarshipRoutingModule } from './scholarship-routing.module';
import { SholarshipPageComponent } from './sholarship-page/sholarship-page.component';
import { SharedModule } from '../_shared/_shared.module';
@NgModule({
  imports: [
    CommonModule,
    ScholarshipRoutingModule,
    SharedModule
  ],
  declarations: [SholarshipPageComponent]
})
export class ScholarshipModule { }
