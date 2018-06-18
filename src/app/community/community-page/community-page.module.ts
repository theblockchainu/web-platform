import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../_shared/_shared.module';
import { MessageParticipantComponent } from './message-participant/message-participant.component';
import { CommunityPageRoutingModule } from './community-page-routing.module';
import { ProjectSubmissionService } from '../../_services/project-submission/project-submission.service';
import { ANIMATION_TYPES, LoadingModule } from 'ngx-loading';
import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
import { StickyModule } from 'ng2-sticky-kit';
import { CommunityPageComponent } from './community-page.component';
import { CommunityPageQuestionsComponent } from './community-page-questions/community-page-questions.component';
import { CommunityPageClassesComponent } from './community-page-classes/community-page-classes.component';
import { CommunityPageExperiencesComponent } from './community-page-experiences/community-page-experiences.component';
import { CommunityPageLinksComponent } from './community-page-links/community-page-links.component';

@NgModule({
  imports: [
    CommunityPageRoutingModule,
    CommonModule,
    SharedModule,
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.threeBounce,
      backdropBackgroundColour: 'rgba(0,0,0,0)',
      backdropBorderRadius: '0px',
      primaryColour: '#33bd9e',
      secondaryColour: '#ff5b5f',
      tertiaryColour: '#ff6d71'
    }),
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    StickyModule
  ],

  declarations: [CommunityPageComponent, MessageParticipantComponent, CommunityPageQuestionsComponent, CommunityPageClassesComponent, CommunityPageExperiencesComponent, CommunityPageLinksComponent],
  bootstrap: [MessageParticipantComponent],
  providers: [ProjectSubmissionService]

})
export class CommunityPageModule { }
