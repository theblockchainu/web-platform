import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContentRoutingModule } from './content-routing.module';
import { ContentPageComponent } from './content-page/content-page.component';
import { SharedModule } from '../_shared/_shared.module';
@NgModule({
  imports: [
    CommonModule,
    ContentRoutingModule,
    SharedModule
  ],
  declarations: [
    ContentPageComponent
  ]
})
export class ContentModule { }
