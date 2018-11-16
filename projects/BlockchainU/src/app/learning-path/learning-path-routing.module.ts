import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':collectionId/edit',
        loadChildren: './learning-path-edit/learning-path-edit.module#LearningPathEditModule'
      },
      {
        path: ':collectionId',
        loadChildren: './learning-path-page/learning-path-page.module#LearningPathPageModule'
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearningPathRoutingModule { }
