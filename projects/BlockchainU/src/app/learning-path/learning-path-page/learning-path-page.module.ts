import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LearningPathPageRoutingModule } from './learning-path-page-routing.module';
import { LearningPathPageComponent } from './learning-path-page/learning-path-page.component';
import { IntroCardComponent } from './learning-path-page/sections/intro-card/intro-card.component';
import { PathSectionComponent } from './learning-path-page/sections/path-section/path-section.component';
import { TeachersSectionComponent } from './learning-path-page/sections/teachers-section/teachers-section.component';

import { MatCardModule, MatButtonModule, MatDividerModule, MatIconModule } from '@angular/material';
import { NgPipesModule } from 'ngx-pipes';
import { CovalentMarkdownModule } from '@covalent/markdown';
import { ProfilePopupModule } from '../../_shared/profile-popup/profile-popup.module';
import { SharedModule } from '../../_shared/shared-module/shared.module';
import { PeerCardModule } from '../../_shared/peer-card/peer-card.module';
import { SafePipeModule } from '../../_shared/safe-pipe/safe-pipe.module';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    LearningPathPageRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    NgPipesModule,
    CovalentMarkdownModule,
    ProfilePopupModule,
    SharedModule,
    PeerCardModule,
    SafePipeModule,
    RatingModule,
    FormsModule
  ],
  declarations: [LearningPathPageComponent, IntroCardComponent, PathSectionComponent, TeachersSectionComponent]
})
export class LearningPathPageModule { }
