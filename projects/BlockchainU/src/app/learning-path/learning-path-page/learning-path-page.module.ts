import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearningPathPageRoutingModule } from './learning-path-page-routing.module';
import { LearningPathPageComponent } from './learning-path-page/learning-path-page.component';
import { IntroCardComponent } from './learning-path-page/sections/intro-card/intro-card.component';
import { PathSectionComponent } from './learning-path-page/sections/path-section/path-section.component';
import { TechersSectionComponent } from './learning-path-page/sections/techers-section/techers-section.component';

import { MatCardModule, MatButtonModule, MatDividerModule, MatIconModule } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    LearningPathPageRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  declarations: [LearningPathPageComponent, IntroCardComponent, PathSectionComponent, TechersSectionComponent]
})
export class LearningPathPageModule { }
