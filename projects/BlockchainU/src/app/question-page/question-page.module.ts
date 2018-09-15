import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuestionPageRoutingModule } from './question-page-routing.module';
import { QuestionPageComponent } from './question-page/question-page.component';
import { SharedModule } from '../_shared/_shared.module';
@NgModule({
  imports: [
    CommonModule,
    QuestionPageRoutingModule,
    SharedModule
  ],
  declarations: [QuestionPageComponent]
})
export class QuestionPageModule { }
