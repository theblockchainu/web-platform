import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuestionPageComponent } from './question-page/question-page.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':questionId',
        component: QuestionPageComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionPageRoutingModule { }
