import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScholarshipRoutingModule } from './scholarship-routing.module';
import { SholarshipPageComponent } from './sholarship-page/sholarship-page.component';

@NgModule({
  imports: [
    CommonModule,
    ScholarshipRoutingModule
  ],
  declarations: [SholarshipPageComponent]
})
export class ScholarshipModule { }
