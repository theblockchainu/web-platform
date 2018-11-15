import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LearningPathEditComponent } from './learning-path-edit/learning-path-edit.component';

const routes: Routes = [
  {
    path: ':step',
    component: LearningPathEditComponent
  },
  {
    path: '',
    component: LearningPathEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearningPathEditRoutingModule { }
