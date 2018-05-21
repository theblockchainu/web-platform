import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KnowledgeStoryComponent } from './knowledge-story/knowledge-story.component';
import { AuthGuardService } from '../_services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':storyId',
        component: KnowledgeStoryComponent,
        canActivateChild: [AuthGuardService]
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowledgeStoryRoutingModule { }
