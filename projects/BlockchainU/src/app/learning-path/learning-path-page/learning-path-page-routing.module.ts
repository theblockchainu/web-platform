import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LearningPathPageComponent } from './learning-path-page/learning-path-page.component';

const routes: Routes = [
  {
    path: '',
    component: LearningPathPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearningPathPageRoutingModule { }
