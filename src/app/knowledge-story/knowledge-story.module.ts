import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KnowledgeStoryRoutingModule } from './knowledge-story-routing.module';
import { KnowledgeStoryComponent } from './knowledge-story/knowledge-story.component';
import { SharedModule } from '../_shared/_shared.module';

@NgModule({
  imports: [
    CommonModule,
    KnowledgeStoryRoutingModule,
    SharedModule
  ],
  declarations: [KnowledgeStoryComponent]
})
export class KnowledgeStoryModule { }
