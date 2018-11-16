import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearningPathPageRoutingModule } from './learning-path-page-routing.module';
import { LearningPathPageComponent } from './learning-path-page/learning-path-page.component';

@NgModule({
  imports: [
    CommonModule,
    LearningPathPageRoutingModule
  ],
  declarations: [LearningPathPageComponent]
})
export class LearningPathPageModule { }
